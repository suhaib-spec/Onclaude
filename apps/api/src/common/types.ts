// Shared domain types — mirror docs/mvp/MVP_SPEC.md §3 exactly.

export type Domain = 'business' | 'data' | 'coding' | 'math' | 'other';
export type Tier = 'strict' | 'standard';

export interface Material {
  id: string;
  name: string;
  kind: 'markdown' | 'csv' | 'text' | 'code';
  content: string;
}
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}
export interface HintStep {
  level: 1 | 2 | 3 | 4;
  text: string;
}
export interface AllowedHelp {
  clarify: boolean;
  concepts: boolean;
  methods: boolean;
  materials: boolean;
  strategy: boolean;
}
export type HintCosts = { 1: number; 2: number; 3: number; 4: number };
export interface Guardrails {
  tier: Tier;
  allowedHelp: AllowedHelp;
  hintLadder: HintStep[];
  hintBudget: number;
  hintCosts: HintCosts;
  forbiddenTerms: string[];
  customRules: string;
}

export type SessionStatus = 'invited' | 'in_progress' | 'submitted' | 'evaluated';

export type Intent =
  | 'clarify'
  | 'concept'
  | 'method'
  | 'materials'
  | 'strategy'
  | 'hypothesis_check'
  | 'hint_request'
  | 'solution_request'
  | 'injection'
  | 'off_topic';

export const INTENTS: Intent[] = [
  'clarify',
  'concept',
  'method',
  'materials',
  'strategy',
  'hypothesis_check',
  'hint_request',
  'solution_request',
  'injection',
  'off_topic',
];

export type Decision = 'answer' | 'hint' | 'decline' | 'redirect';

export interface JudgeMeta {
  verdict: 'pass' | 'rewritten' | 'fallback';
  reasons: string[];
  deterministicHits: string[];
}

export interface MessageMeta {
  intent: Intent;
  decision: Decision;
  hintLevel?: number;
  hintCost?: number;
  judge?: JudgeMeta;
  latencyMs?: number;
  mock?: boolean;
}

export interface CriterionScore {
  criterionId: string;
  name: string;
  weight: number;
  score: number;
  rationale: string;
}
export interface Evaluation {
  overallScore: number;
  verdict: 'strong' | 'acceptable' | 'weak';
  criteria: CriterionScore[];
  strengths: string[];
  gaps: string[];
  summary: string;
  hintPenalty: number;
  finalScore: number;
  mock?: boolean;
}

export interface InsightStats {
  messages: number;
  hintsUsed: number;
  hintPointsSpent: number;
  maxHintLevel: number;
  solutionRequests: number;
  injectionAttempts: number;
  clarifyingQuestions: number;
  conceptQuestions: number;
  durationMinutes: number;
}
export interface Behaviour {
  label: string;
  evidence: string;
  polarity: 'good' | 'concern';
}
export interface Insights {
  aiUsageScore: number;
  stats: InsightStats;
  behaviours: Behaviour[];
  summary: string;
  mock?: boolean;
}

/** Highest hint level a tier allows (strict 3, standard 4), capped by the authored ladder when one exists. */
export function maxHintLevelFor(guardrails: Guardrails): number {
  const tierMax = guardrails.tier === 'strict' ? 3 : 4;
  const ladderMax = Math.max(0, ...(guardrails.hintLadder ?? []).map((s) => s.level));
  return ladderMax > 0 ? Math.min(tierMax, ladderMax) : tierMax;
}
