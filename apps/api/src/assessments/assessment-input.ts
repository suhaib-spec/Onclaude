import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Domain, Guardrails, HintStep, Material, RubricCriterion, Tier } from '../common/types';

const DOMAINS: Domain[] = ['business', 'data', 'coding', 'math', 'other'];
const KINDS: Material['kind'][] = ['markdown', 'csv', 'text', 'code'];

export const DEFAULT_GUARDRAILS: Guardrails = {
  tier: 'standard',
  allowedHelp: { clarify: true, concepts: true, methods: true, materials: true, strategy: true },
  hintLadder: [],
  hintBudget: 4,
  hintCosts: { 1: 2, 2: 4, 3: 6, 4: 10 },
  forbiddenTerms: [],
  customRules: '',
};

const str = (v: unknown, fallback = '') => (v === undefined || v === null ? fallback : String(v));
const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);

/** Validates and normalises an Assessment body (minus id/createdAt), filling sensible defaults. */
export function normaliseAssessmentInput(body: any) {
  if (!body || typeof body !== 'object') throw new BadRequestException('Body must be an Assessment object');
  const title = str(body.title).trim();
  if (!title) throw new BadRequestException('title is required');
  const g = body.guardrails ?? {};
  const tier: Tier = g.tier === 'strict' ? 'strict' : 'standard';
  const ah = g.allowedHelp ?? {};
  const costs = g.hintCosts ?? {};

  const materials: Material[] = (Array.isArray(body.materials) ? body.materials : []).map((m: any) => ({
    id: str(m?.id) || randomUUID(),
    name: str(m?.name, 'Untitled'),
    kind: KINDS.includes(m?.kind) ? m.kind : 'text',
    content: str(m?.content),
  }));
  const rubric: RubricCriterion[] = (Array.isArray(body.rubric) ? body.rubric : []).map((c: any) => ({
    id: str(c?.id) || randomUUID(),
    name: str(c?.name, 'Criterion'),
    description: str(c?.description),
    weight: num(c?.weight, 0),
  }));
  const hintLadder: HintStep[] = (Array.isArray(g.hintLadder) ? g.hintLadder : [])
    .filter((h: any) => [1, 2, 3, 4].includes(Number(h?.level)))
    .map((h: any) => ({ level: Number(h.level) as HintStep['level'], text: str(h.text) }))
    .sort((a: HintStep, b: HintStep) => a.level - b.level);

  const guardrails: Guardrails = {
    tier,
    allowedHelp: {
      clarify: bool(ah.clarify, true),
      concepts: bool(ah.concepts, true),
      methods: bool(ah.methods, true),
      materials: bool(ah.materials, true),
      strategy: bool(ah.strategy, true),
    },
    hintLadder,
    hintBudget: Math.max(0, Math.round(num(g.hintBudget, DEFAULT_GUARDRAILS.hintBudget))),
    hintCosts: {
      1: Math.max(0, num(costs[1], DEFAULT_GUARDRAILS.hintCosts[1])),
      2: Math.max(0, num(costs[2], DEFAULT_GUARDRAILS.hintCosts[2])),
      3: Math.max(0, num(costs[3], DEFAULT_GUARDRAILS.hintCosts[3])),
      4: Math.max(0, num(costs[4], DEFAULT_GUARDRAILS.hintCosts[4])),
    },
    forbiddenTerms: (Array.isArray(g.forbiddenTerms) ? g.forbiddenTerms : []).map((t: unknown) => str(t).trim()).filter(Boolean),
    customRules: str(g.customRules),
  };

  return {
    title,
    role: str(body.role),
    domain: DOMAINS.includes(body.domain) ? (body.domain as Domain) : 'other',
    summary: str(body.summary),
    timeLimitMinutes: Math.max(1, Math.round(num(body.timeLimitMinutes, 45))),
    problemStatement: str(body.problemStatement),
    materials,
    referenceAnswer: str(body.referenceAnswer),
    rubric,
    guardrails,
    isDemo: bool(body.isDemo, false),
  };
}
