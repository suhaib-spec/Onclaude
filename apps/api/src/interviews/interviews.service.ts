import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { parseJsonObject } from '../ai/json';
import { LLM_PROVIDER, LlmProvider } from '../ai/llm/llm.provider';
import { InterviewSession } from './interview-session.entity';
import {
  PLAN_SYSTEM,
  planUserPrompt,
  SCORECARD_SYSTEM,
  scorecardUserPrompt,
  TURN_SYSTEM,
  turnUserPrompt,
} from './interview.prompts';
import { Competency, CompetencyScore, InterviewPlan, LiveScore, Question, Scorecard, Turn } from './interview.types';
import {
  closing,
  DEMO_JD,
  followUpText,
  greeting,
  MAYA_CHEN_ANSWERS,
  mockAck,
  mockPlan,
  mockScore,
  mockScorecard,
  needsFollowUp,
  overallOf,
  pickEvidence,
  recommendationOf,
  signalOf,
  summaryFor,
  wordCount,
} from './mock-brain';

export interface CreateInterviewInput {
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  candidateName?: string;
}

interface TurnDecision {
  live: LiveScore;
  askFollowUp: boolean;
  ack: string | null;
}

/** Runs the live AI interview (T-021). Live mode uses the LlmProvider; any failure falls back to mock-brain.ts. */
@Injectable()
export class InterviewsService {
  private readonly log = new Logger(InterviewsService.name);
  /** Clock override used by the seeder to spread turns over time. */
  private clock: (() => Date) | null = null;

  constructor(
    @InjectRepository(InterviewSession) private readonly repo: Repository<InterviewSession>,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
  ) {}

  demoJd() {
    return { ...DEMO_JD };
  }

  async list() {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map((s) => ({
      id: s.id,
      jobTitle: s.jobTitle,
      company: s.company,
      candidateName: s.candidateName,
      status: s.status,
      overall: s.scorecard?.overall ?? null,
      recommendation: s.scorecard?.recommendation ?? null,
      createdAt: s.createdAt,
    }));
  }

  async get(id: string): Promise<InterviewSession> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Interview not found');
    return s;
  }

  async create(input: CreateInterviewInput, forceMock = false): Promise<InterviewSession> {
    const jobDescription = String(input?.jobDescription ?? '').trim() || DEMO_JD.jobDescription;
    const jobTitle = String(input?.jobTitle ?? '').trim() || (jobDescription === DEMO_JD.jobDescription ? DEMO_JD.jobTitle : 'the role');
    const company = String(input?.company ?? '').trim() || (jobDescription === DEMO_JD.jobDescription ? DEMO_JD.company : 'our company');
    const candidateName = String(input?.candidateName ?? '').trim() || 'Candidate';
    if (jobDescription.length > 20000) throw new BadRequestException('Job description is too long (max 20,000 characters).');

    const plan = await this.plan(jobTitle, company, jobDescription, forceMock);
    const s = this.repo.create({
      jobTitle,
      company,
      jobDescription,
      candidateName,
      status: 'in_progress',
      competencies: plan.competencies,
      questions: plan.questions,
      currentIndex: 0,
      followUpAsked: false,
      transcript: [],
      scores: [],
      scorecard: null,
      completedAt: null,
    });
    s.scores = this.rollUp(s);
    const q = plan.questions[0];
    s.transcript.push(this.turn('interviewer', 'greeting', greeting(candidateName, jobTitle, company)));
    s.transcript.push(this.turn('interviewer', 'question', q.text, { competencyId: q.competencyId, questionIndex: 0 }));
    return this.repo.save(s);
  }

  async answer(id: string, text: string, forceMock = false): Promise<InterviewSession> {
    const s = await this.get(id);
    if (s.status === 'completed') throw new BadRequestException('This interview is already finished.');
    const answer = String(text ?? '').trim();
    if (!answer) throw new BadRequestException('Answer text is required.');
    if (answer.length > 8000) throw new BadRequestException('Answer is too long (max 8,000 characters).');

    const idx = s.currentIndex;
    const q = s.questions[idx];
    const c = s.competencies.find((x) => x.id === q.competencyId) ?? s.competencies[idx];
    const next = s.questions[idx + 1];
    const nextC = next ? s.competencies.find((x) => x.id === next.competencyId) : undefined;

    // A follow-up answer is scored together with the original answer to the same question.
    const previous = s.followUpAsked
      ? s.transcript.filter((t) => t.kind === 'answer' && t.questionIndex === idx).map((t) => t.text)
      : [];
    const scoredText = [...previous, answer].join('\n');
    const followUpAllowed = !s.followUpAsked;

    const decision = await this.decide(c, s.followUpAsked ? q.followUp : q.text, scoredText, answer, followUpAllowed, idx, nextC, forceMock);
    // Evidence must be the candidate's own words, verbatim.
    // Prefer a quote from the newest answer (a follow-up should not quote the weak first attempt back).
    if (!decision.live.evidence || !answer.includes(decision.live.evidence.replace(/…$/, ''))) {
      decision.live.evidence = pickEvidence(answer, c.keywords);
    }

    s.transcript.push(this.turn('candidate', 'answer', answer, { competencyId: c.id, questionIndex: idx, liveScore: decision.live }));

    if (followUpAllowed && decision.askFollowUp) {
      s.followUpAsked = true;
      s.transcript.push(this.turn('interviewer', 'follow_up', followUpText(q, idx, answer), { competencyId: c.id, questionIndex: idx }));
    } else if (next) {
      const ack = decision.ack || mockAck(answer, c, idx, nextC);
      s.transcript.push(this.turn('interviewer', 'ack', ack, { competencyId: c.id, questionIndex: idx }));
      s.currentIndex = idx + 1;
      s.followUpAsked = false;
      s.transcript.push(this.turn('interviewer', 'question', next.text, { competencyId: next.competencyId, questionIndex: idx + 1 }));
    } else {
      s.scores = this.rollUp(s);
      return this.complete(s, false, forceMock);
    }
    s.scores = this.rollUp(s);
    return this.repo.save(s);
  }

  async finish(id: string): Promise<InterviewSession> {
    const s = await this.get(id);
    if (s.status === 'completed') return s;
    s.scores = this.rollUp(s);
    return this.complete(s, true, false);
  }

  /** Creates the completed "Maya Chen" demo interview (deterministic mock, spread over the last ~20 minutes). */
  async seedDemo(): Promise<InterviewSession> {
    const start = Date.now() - 26 * 60000;
    let tick = 0;
    this.clock = () => new Date(start + tick++ * 70000);
    try {
      const s = await this.create({ ...DEMO_JD, candidateName: 'Maya Chen' }, true);
      let cur = s;
      for (const a of MAYA_CHEN_ANSWERS) {
        if (cur.status === 'completed') break;
        cur = await this.answer(cur.id, a, true);
      }
      return cur;
    } finally {
      this.clock = null;
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  private now(): string {
    return (this.clock ? this.clock() : new Date()).toISOString();
  }

  private turn(role: Turn['role'], kind: Turn['kind'], text: string, extra: Partial<Turn> = {}): Turn {
    return { id: randomUUID(), role, kind, text, at: this.now(), ...extra };
  }

  private async complete(s: InterviewSession, early: boolean, forceMock: boolean): Promise<InterviewSession> {
    s.transcript.push(this.turn('interviewer', 'closing', closing(s.candidateName, s.company, early)));
    s.status = 'completed';
    s.completedAt = new Date(this.now());
    s.scorecard = await this.scorecard(s, forceMock);
    return this.repo.save(s);
  }

  /** Per-competency roll-up: average across the answers to that competency (a follow-up recovers some, not all). */
  private rollUp(s: InterviewSession): CompetencyScore[] {
    return s.competencies.map((c) => {
      const answers = s.transcript.filter((t) => t.kind === 'answer' && t.liveScore?.competencyId === c.id);
      const best = answers.reduce((m, t) => Math.max(m, t.liveScore!.score), 0);
      const solid = answers.filter((t) => t.liveScore!.signal !== 'weak');
      const evidence = (solid.length ? solid : answers)
        .slice()
        .sort((a, b) => b.liveScore!.score - a.liveScore!.score)
        .map((t) => t.liveScore!.evidence)
        .filter((e, i, arr) => e && arr.indexOf(e) === i);
      const mean = answers.length ? answers.reduce((m, t) => m + t.liveScore!.score, 0) / answers.length : 0;
      const score = Math.round((answers.length > 1 ? (best + mean) / 2 : best) * 10) / 10;
      return { competencyId: c.id, name: c.name, weight: c.weight, score, jdQuote: c.jdQuote, evidence, summary: summaryFor(c, score, answers.length > 0) };
    });
  }

  private async plan(jobTitle: string, company: string, jd: string, forceMock: boolean): Promise<InterviewPlan> {
    if (this.llm.mode === 'live' && !forceMock) {
      try {
        const raw = await this.llm.complete({ model: 'tutor', system: PLAN_SYSTEM, messages: [{ role: 'user', content: planUserPrompt(jobTitle, company, jd) }], maxTokens: 2000 });
        const plan = this.validatePlan(parseJsonObject<any>(raw), jd);
        if (plan) return plan;
        this.log.warn('Interview plan from the model was invalid; using the mock plan.');
      } catch (err: any) {
        this.log.warn(`Interview plan failed (${err?.message ?? err}); using the mock plan.`);
      }
    }
    return mockPlan(jobTitle, company, jd);
  }

  private validatePlan(p: any, jd: string): InterviewPlan | null {
    if (!p || !Array.isArray(p.competencies) || !Array.isArray(p.questions) || p.competencies.length !== 4 || p.questions.length < 4) return null;
    const fallback = mockPlan('', '', jd);
    const competencies: Competency[] = p.competencies.map((c: any, i: number) => {
      const id = String(c?.id || `c${i + 1}`).toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40) || `c${i + 1}`;
      const quote = String(c?.jdQuote ?? '').trim();
      return {
        id,
        name: String(c?.name ?? `Competency ${i + 1}`).slice(0, 60),
        description: String(c?.description ?? '').slice(0, 240),
        weight: Math.max(1, Number(c?.weight) || 25),
        jdQuote: quote && jd.includes(quote) ? quote : fallback.competencies[i].jdQuote,
        keywords: (Array.isArray(c?.keywords) ? c.keywords : []).map((k: any) => String(k).toLowerCase().trim()).filter(Boolean).slice(0, 25),
      };
    });
    if (new Set(competencies.map((c) => c.id)).size !== 4) return null;
    // Normalise weights to sum to exactly 100.
    const total = competencies.reduce((s, c) => s + c.weight, 0);
    competencies.forEach((c) => (c.weight = Math.round((c.weight / total) * 100)));
    competencies[0].weight += 100 - competencies.reduce((s, c) => s + c.weight, 0);
    const questions: Question[] = competencies.map((c, i) => {
      const q = p.questions.find((x: any) => String(x?.competencyId ?? '').toLowerCase() === c.id) ?? p.questions[i];
      return { id: `q${i + 1}`, competencyId: c.id, text: String(q?.text ?? '').trim(), followUp: String(q?.followUp ?? '').trim() || 'Can you give me a specific example, with your own role and the outcome?' };
    });
    if (questions.some((q) => q.text.length < 10)) return null;
    return { competencies, questions };
  }

  private async decide(
    c: Competency,
    question: string,
    scoredText: string,
    answer: string,
    followUpAllowed: boolean,
    idx: number,
    nextC: Competency | undefined,
    forceMock: boolean,
  ): Promise<TurnDecision> {
    if (this.llm.mode === 'live' && !forceMock) {
      try {
        const raw = await this.llm.complete({
          model: 'judge',
          system: TURN_SYSTEM,
          messages: [{ role: 'user', content: turnUserPrompt({ competency: c, question, answer: scoredText, followUpAllowed }) }],
          maxTokens: 500,
        });
        const p = parseJsonObject<any>(raw);
        const score = Number(p?.score);
        if (p && score >= 1 && score <= 5) {
          const rounded = Math.round(score * 2) / 2;
          const live: LiveScore = { competencyId: c.id, score: rounded, signal: signalOf(rounded), evidence: String(p.evidence ?? '').trim(), reason: String(p.reason ?? '').trim() || 'Scored against the job description.' };
          const ackRaw = String(p.ack ?? '').trim();
          const ack = ackRaw ? (nextC ? `${ackRaw} Next, let's talk about ${nextC.name.toLowerCase()}.` : ackRaw) : null;
          return { live, askFollowUp: followUpAllowed && (!!p.askFollowUp || wordCount(answer) < 12), ack };
        }
        this.log.warn('Turn scoring from the model was invalid; using the mock.');
      } catch (err: any) {
        this.log.warn(`Turn scoring failed (${err?.message ?? err}); using the mock.`);
      }
    }
    const live = mockScore(scoredText, c);
    return { live, askFollowUp: followUpAllowed && needsFollowUp(answer, live), ack: null };
  }

  private async scorecard(s: InterviewSession, forceMock: boolean): Promise<Scorecard> {
    const mock = mockScorecard(s.competencies, s.scores);
    if (this.llm.mode !== 'live' || forceMock) return mock;
    try {
      const overall = overallOf(s.scores);
      const recommendation = recommendationOf(overall);
      const raw = await this.llm.complete({
        model: 'tutor',
        system: SCORECARD_SYSTEM,
        messages: [{ role: 'user', content: scorecardUserPrompt({ jobTitle: s.jobTitle, recommendation, overall, scores: s.scores, questions: s.questions }) }],
        maxTokens: 700,
      });
      const p = parseJsonObject<any>(raw);
      const list = (v: any) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 3) : []);
      const cta = String(p?.cta ?? '').replace(/\s+/g, ' ').trim();
      if (!cta) throw new Error('No CTA in model output');
      const strengths = list(p?.strengths);
      const concerns = list(p?.concerns);
      return { overall, recommendation, cta, strengths: strengths.length ? strengths : mock.strengths, concerns: concerns.length ? concerns : mock.concerns };
    } catch (err: any) {
      this.log.warn(`Scorecard failed (${err?.message ?? err}); using the mock scorecard.`);
      return mock;
    }
  }
}
