import { Inject, Injectable, Logger } from '@nestjs/common';
import { CriterionScore, Evaluation, RubricCriterion } from '../common/types';
import { Assessment, Session } from '../entities';
import { parseJsonObject } from './json';
import { LLM_PROVIDER, LlmProvider } from './llm/llm.provider';
import { buildEvaluationUserPrompt, EVALUATION_SYSTEM } from './prompts/evaluation.prompt';

/** Scores the final answer against the rubric (TUTOR_MODEL), with a keyword heuristic as the mock/fallback. */
@Injectable()
export class Evaluator {
  private readonly log = new Logger(Evaluator.name);
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  async evaluate(assessment: Assessment, session: Session): Promise<Evaluation> {
    const rubric = normaliseRubric(assessment.rubric);
    if (this.llm.mode === 'live') {
      try {
        const raw = await this.llm.complete({
          model: 'tutor',
          system: EVALUATION_SYSTEM,
          messages: [
            {
              role: 'user',
              content: buildEvaluationUserPrompt({
                title: assessment.title,
                problemStatement: assessment.problemStatement,
                referenceAnswer: assessment.referenceAnswer,
                rubric,
                answer: session.answer ?? '',
              }),
            },
          ],
          maxTokens: 1500,
        });
        const parsed = parseJsonObject<any>(raw);
        if (parsed && Array.isArray(parsed.criteria)) {
          const criteria: CriterionScore[] = rubric.map((c) => {
            const found = parsed.criteria.find((x: any) => String(x?.criterionId) === c.id);
            return {
              criterionId: c.id,
              name: c.name,
              weight: c.weight,
              score: clamp(Math.round(Number(found?.score ?? 0)), 0, 5),
              rationale: String(found?.rationale ?? 'Not assessed.'),
            };
          });
          return finalise(criteria, session.hintPointsSpent, {
            strengths: strList(parsed.strengths),
            gaps: strList(parsed.gaps),
            summary: String(parsed.summary ?? ''),
            mock: false,
          });
        }
        this.log.warn('Unparseable evaluation output; using heuristic.');
      } catch (err: any) {
        this.log.warn(`Evaluation LLM failed (${err?.message}); using heuristic.`);
      }
    }
    return heuristicEvaluation(assessment, session, rubric);
  }
}

function normaliseRubric(rubric: RubricCriterion[] | null | undefined): RubricCriterion[] {
  const list = (rubric ?? []).filter((c) => c && c.id);
  if (list.length) return list;
  return [{ id: 'overall', name: 'Overall quality', description: 'Correctness, reasoning and clarity of the answer.', weight: 100 }];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 6) : [];
}

/** overallScore = weighted %, hintPenalty = hint points, finalScore = max(0, overall - penalty). */
export function finalise(
  criteria: CriterionScore[],
  hintPointsSpent: number,
  extra: { strengths: string[]; gaps: string[]; summary: string; mock: boolean },
): Evaluation {
  const totalWeight = criteria.reduce((s, c) => s + (c.weight || 0), 0) || 1;
  const overallScore = Math.round(criteria.reduce((s, c) => s + (c.weight || 0) * (c.score / 5), 0) * (100 / totalWeight));
  const hintPenalty = Math.max(0, Number(hintPointsSpent) || 0);
  const finalScore = Math.max(0, overallScore - hintPenalty);
  const verdict = finalScore >= 75 ? 'strong' : finalScore >= 50 ? 'acceptable' : 'weak';
  return { overallScore, verdict, criteria, ...extra, hintPenalty, finalScore };
}

const STOP = new Set(
  'the a an and or of to in on for with is are be by as at it this that from into than then their there these those which what when how why your you our we they has have had was were will would should could can not but if so do does did about over under per vs each any all more most less very also just only'.split(' '),
);

function keywords(text: string): Set<string> {
  return new Set(
    String(text ?? '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}%.\s-]/gu, ' ')
      .split(/\s+/)
      .map((w) => w.replace(/^[.-]+|[.-]+$/g, ''))
      .filter((w) => w.length > 3 && !STOP.has(w)),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  if (!a.size) return 0;
  let hit = 0;
  for (const w of a) if (b.has(w)) hit++;
  return hit / a.size;
}

/** Mock/fallback: keyword overlap with the reference answer and each criterion, plus answer substance. */
export function heuristicEvaluation(assessment: Assessment, session: Session, rubric: RubricCriterion[]): Evaluation {
  const answer = session.answer ?? '';
  const ans = keywords(answer);
  const refOverlap = overlap(keywords(assessment.referenceAnswer), ans);
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const substance = Math.min(1, words / 180);

  const criteria: CriterionScore[] = rubric.map((c) => {
    const critOverlap = overlap(keywords(`${c.name} ${c.description}`), ans);
    const raw = words === 0 ? 0 : 5 * (0.45 * Math.min(1, refOverlap * 2.2) + 0.3 * Math.min(1, critOverlap * 2) + 0.25 * substance);
    const score = clamp(Math.round(raw), 0, 5);
    const rationale =
      words === 0
        ? 'No answer was submitted.'
        : score >= 4
          ? `Covers most of what "${c.name}" asks for, in line with the reference answer.`
          : score >= 3
            ? `Addresses "${c.name}" reasonably, though some points from the reference are missing or thin.`
            : score >= 2
              ? `Only partly addresses "${c.name}"; key elements of the reference answer are absent.`
              : `Little evidence of "${c.name}" in the answer.`;
    return { criterionId: c.id, name: c.name, weight: c.weight, score, rationale };
  });

  const strong = criteria.filter((c) => c.score >= 4).map((c) => `Solid on ${c.name.toLowerCase()}`);
  const weak = criteria.filter((c) => c.score <= 2).map((c) => `Needs more depth on ${c.name.toLowerCase()}`);
  const strengths = strong.length ? strong : words > 60 ? ['Gave a structured written answer'] : [];
  const gaps = weak.length ? weak : words < 60 ? ['Answer is brief; reasoning could be more explicit'] : [];
  const summary =
    words === 0
      ? 'The candidate did not submit an answer.'
      : `Heuristic (mock) evaluation: the answer overlaps ~${Math.round(refOverlap * 100)}% with the reference answer's key terms across ${words} words. Connect an Anthropic key for a full rubric-based assessment.`;
  return finalise(criteria, session.hintPointsSpent, { strengths, gaps, summary, mock: true });
}
