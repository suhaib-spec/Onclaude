import { Inject, Injectable, Logger } from '@nestjs/common';
import { Behaviour, Insights, InsightStats } from '../common/types';
import { Assessment, Message, Session } from '../entities';
import { parseJsonObject } from './json';
import { LLM_PROVIDER, LlmProvider } from './llm/llm.provider';
import { buildInsightsUserPrompt, INSIGHTS_SYSTEM } from './prompts/insights.prompt';

/** AI-usage insights: deterministic stats + score, with an LLM (or heuristic) narrative. */
@Injectable()
export class InsightsService {
  private readonly log = new Logger(InsightsService.name);
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  async analyse(assessment: Assessment, session: Session, messages: Message[]): Promise<Insights> {
    const stats = computeStats(session, messages);
    const pattern = analyseHintPattern(session, messages);
    const aiUsageScore = computeAiUsageScore(stats, pattern);
    if (this.llm.mode === 'live' && messages.length) {
      try {
        const raw = await this.llm.complete({
          model: 'tutor',
          system: INSIGHTS_SYSTEM,
          messages: [
            {
              role: 'user',
              content: buildInsightsUserPrompt({
                title: assessment.title,
                stats,
                transcript: messages.map((m) => ({ role: m.role, content: m.content, intent: m.meta?.intent, decision: m.meta?.decision })),
              }),
            },
          ],
          maxTokens: 900,
        });
        const parsed = parseJsonObject<any>(raw);
        if (parsed && Array.isArray(parsed.behaviours)) {
          const behaviours: Behaviour[] = parsed.behaviours.slice(0, 6).map((b: any) => ({
            label: String(b?.label ?? 'Observation'),
            evidence: String(b?.evidence ?? ''),
            polarity: b?.polarity === 'concern' ? 'concern' : 'good',
          }));
          return { aiUsageScore, stats, behaviours, summary: String(parsed.summary ?? ''), mock: false };
        }
        this.log.warn('Unparseable insights output; using heuristic.');
      } catch (err: any) {
        this.log.warn(`Insights LLM failed (${err?.message}); using heuristic.`);
      }
    }
    return { aiUsageScore, stats, ...heuristicNarrative(stats, pattern, session, messages), mock: true };
  }
}

export function computeStats(session: Session, messages: Message[]): InsightStats {
  const candidateMsgs = messages.filter((m) => m.role === 'candidate');
  const count = (intent: string) => candidateMsgs.filter((m) => m.meta?.intent === intent).length;
  const maxHintLevel = Math.max(session.hintLevelUnlocked ?? 0, ...messages.map((m) => m.meta?.hintLevel ?? 0));
  const start = session.startedAt ? new Date(session.startedAt).getTime() : null;
  const end = session.submittedAt ? new Date(session.submittedAt).getTime() : Date.now();
  return {
    messages: candidateMsgs.length,
    hintsUsed: session.hintsUsed ?? 0,
    hintPointsSpent: session.hintPointsSpent ?? 0,
    maxHintLevel,
    solutionRequests: count('solution_request'),
    injectionAttempts: count('injection'),
    clarifyingQuestions: count('clarify'),
    conceptQuestions: count('concept') + count('method'),
    durationMinutes: start ? Math.max(0, Math.round((end - start) / 60000)) : 0,
  };
}

const EFFORT_INTENTS = new Set(['clarify', 'concept', 'method', 'materials', 'strategy', 'hypothesis_check']);

export interface HintPattern {
  /** Hints requested after visible effort (a real question since the previous hint, or 3+ min of work first). */
  effortfulHints: number;
  /** Hints requested back-to-back with no attempt in between. */
  lazyHints: number;
  hypothesisChecks: number;
}

/** Classifies each hint request by whether the candidate showed effort since the previous hint. */
export function analyseHintPattern(session: Pick<Session, 'startedAt'>, messages: Message[]): HintPattern {
  const candidate = messages.filter((m) => m.role === 'candidate');
  const startedAt = session.startedAt ? new Date(session.startedAt).getTime() : null;
  let effortSinceLastHint = false;
  let firstHint = true;
  let effortfulHints = 0;
  let lazyHints = 0;
  for (const m of candidate) {
    const intent = m.meta?.intent;
    if (intent === 'hint_request') {
      const workedFirst = firstHint && startedAt !== null && new Date(m.createdAt).getTime() - startedAt >= 3 * 60000;
      if (effortSinceLastHint || workedFirst) effortfulHints++;
      else lazyHints++;
      effortSinceLastHint = false;
      firstHint = false;
    } else if (intent && EFFORT_INTENTS.has(intent)) {
      effortSinceLastHint = true;
    }
  }
  return { effortfulHints, lazyHints, hypothesisChecks: candidate.filter((m) => m.meta?.intent === 'hypothesis_check').length };
}

/**
 * "AI collaboration" score (advisory, 0-100). Starts at 70. It does NOT penalise using the AI or hints as such:
 * + clarifying, concept/method questions, testing hypotheses, hints taken after showing effort;
 * - solution-seeking (repeats cost more), injection attempts, hints requested with no attempt in between.
 */
export function computeAiUsageScore(s: InsightStats, p: HintPattern): number {
  let score = 70;
  score += Math.min(10, s.clarifyingQuestions * 4);
  score += Math.min(12, s.conceptQuestions * 3);
  score += Math.min(8, p.hypothesisChecks * 3);
  score += Math.min(6, p.effortfulHints * 2);
  if (s.solutionRequests > 0) score -= 6 + (s.solutionRequests - 1) * 10;
  score -= s.injectionAttempts * 15;
  score -= p.lazyHints * 6;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function heuristicNarrative(s: InsightStats, p: HintPattern, session: Session, messages: Message[]): { behaviours: Behaviour[]; summary: string } {
  const b: Behaviour[] = [];
  const candidate = messages.filter((m) => m.role === 'candidate');
  const first = candidate[0];
  const quote = (m?: Message) => (m ? `"${m.content.slice(0, 80)}${m.content.length > 80 ? '...' : ''}"` : '');

  if (first && session.startedAt) {
    const mins = (new Date(first.createdAt).getTime() - new Date(session.startedAt).getTime()) / 60000;
    if (mins >= 3) b.push({ label: 'Planned before asking', evidence: `First AI question came ${Math.round(mins)} min in, after reading the brief.`, polarity: 'good' });
    else if (first.meta?.intent === 'solution_request' || first.meta?.intent === 'hint_request')
      b.push({ label: 'Reached for AI first', evidence: `Opened with ${quote(first)} within the first minutes.`, polarity: 'concern' });
  }
  if (s.clarifyingQuestions > 0) {
    const m = candidate.find((x) => x.meta?.intent === 'clarify');
    b.push({ label: 'Clarified the problem', evidence: `Asked ${s.clarifyingQuestions} clarifying question(s), e.g. ${quote(m)}.`, polarity: 'good' });
  }
  if (s.conceptQuestions > 0) {
    const m = candidate.find((x) => x.meta?.intent === 'concept' || x.meta?.intent === 'method');
    b.push({ label: 'Used AI to learn', evidence: `Asked ${s.conceptQuestions} concept/method question(s), e.g. ${quote(m)}.`, polarity: 'good' });
  }
  const verify = candidate.find((m) => /\b(verify|double[- ]check|are you sure|check (this|that|my)|cross[- ]check|sanity)\b/i.test(m.content));
  if (verify) b.push({ label: 'Verified claims', evidence: `Tested their own reasoning: ${quote(verify)}.`, polarity: 'good' });
  if (p.hypothesisChecks > 0) {
    const m = candidate.find((x) => x.meta?.intent === 'hypothesis_check');
    b.push({ label: 'Tested hypotheses', evidence: `Put their own conclusions up for testing, e.g. ${quote(m)}.`, polarity: 'good' });
  }
  if (p.effortfulHints > 0) b.push({ label: 'Hints after effort', evidence: `${p.effortfulHints} of ${s.hintsUsed} hint(s) came after a genuine attempt.`, polarity: 'good' });
  if (p.lazyHints >= 2) b.push({ label: 'Hints without trying', evidence: `${p.lazyHints} hint(s) were requested with no attempt in between.`, polarity: 'concern' });
  if (s.solutionRequests > 0) {
    const m = candidate.find((x) => x.meta?.intent === 'solution_request');
    b.push({ label: 'Sought the solution', evidence: `${s.solutionRequests} request(s) for the answer, e.g. ${quote(m)}.`, polarity: 'concern' });
  }
  if (s.injectionAttempts > 0) {
    const m = candidate.find((x) => x.meta?.intent === 'injection');
    b.push({ label: 'Tried to bypass rules', evidence: `${s.injectionAttempts} attempt(s) to override the assistant, e.g. ${quote(m)}.`, polarity: 'concern' });
  }
  if (!candidate.length) b.push({ label: 'Worked independently', evidence: 'Did not use the AI assistant at all.', polarity: 'good' });

  const goods = b.filter((x) => x.polarity === 'good').length;
  const concerns = b.filter((x) => x.polarity === 'concern').length;
  const summary = !candidate.length
    ? 'The candidate solved the assessment without using the AI assistant.'
    : concerns === 0
      ? `Healthy AI collaboration: ${s.messages} message(s), mostly to clarify, learn and test ideas, with ${s.hintsUsed} hint(s) used. The candidate kept ownership of the reasoning.`
      : goods >= concerns
        ? `Mostly constructive AI use across ${s.messages} message(s), with some concerns (${b.filter((x) => x.polarity === 'concern').map((x) => x.label.toLowerCase()).join(', ')}).`
        : `The candidate leaned on the AI for answers rather than understanding (${s.solutionRequests} solution request(s), ${p.lazyHints} hint(s) without an attempt in between). Worth probing their reasoning in a follow-up.`;
  return { behaviours: b.slice(0, 5), summary };
}
