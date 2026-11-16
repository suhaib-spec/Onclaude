// Types copied from docs/mvp/MVP_SPEC.md §3–§4 (T-018). Keep in sync with the backend contract.

export type Domain = 'business' | 'data' | 'coding' | 'math' | 'other';
export type Tier = 'strict' | 'standard'; // strict: max hint level 3; standard: max 4

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
  weight: number; // weights sum to 100
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

export interface HintCosts {
  1: number;
  2: number;
  3: number;
  4: number;
}

export interface Guardrails {
  tier: Tier;
  allowedHelp: AllowedHelp;
  hintLadder: HintStep[];
  hintBudget: number;
  hintCosts: HintCosts;
  forbiddenTerms: string[];
  customRules: string;
}

export interface Assessment {
  id: string;
  title: string;
  role: string;
  domain: Domain;
  summary: string;
  timeLimitMinutes: number;
  problemStatement: string;
  materials: Material[];
  referenceAnswer: string;
  rubric: RubricCriterion[];
  guardrails: Guardrails;
  isDemo: boolean;
  createdAt: string;
}

export type AssessmentInput = Omit<Assessment, 'id' | 'createdAt'>;

export interface AssessmentSummary {
  id: string;
  title: string;
  role: string;
  domain: Domain;
  summary: string;
  timeLimitMinutes: number;
  isDemo: boolean;
  sessionCount: number;
  createdAt: string;
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

export interface Message {
  id: string;
  sessionId: string;
  role: 'candidate' | 'assistant';
  content: string;
  createdAt: string;
  meta: MessageMeta | null;
}

export interface PublicMessageMeta {
  decision: Decision;
  hintLevel?: number;
  hintCost?: number;
}

export interface PublicMessage {
  id: string;
  role: 'candidate' | 'assistant';
  content: string;
  createdAt: string;
  meta: PublicMessageMeta | null;
}

export interface CriterionScore {
  criterionId: string;
  name: string;
  weight: number;
  score: number; // 0-5
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

export interface Session {
  id: string;
  assessmentId: string;
  inviteToken: string;
  candidateName: string | null;
  status: SessionStatus;
  startedAt: string | null;
  submittedAt: string | null;
  answer: string;
  hintLevelUnlocked: number;
  hintsUsed: number;
  hintPointsSpent: number;
  integrityFlags: number;
  evaluation: Evaluation | null;
  insights: Insights | null;
  createdAt: string;
}

export interface SessionRow {
  id: string;
  inviteToken: string;
  candidateName: string | null;
  status: SessionStatus;
  hintsUsed: number;
  finalScore: number | null;
  aiUsageScore: number | null;
  createdAt: string;
}

export interface SessionDetail {
  session: Session;
  assessment: Pick<Assessment, 'id' | 'title' | 'role' | 'domain' | 'rubric' | 'referenceAnswer'>;
  messages: Message[];
}

export interface InviteResponse {
  sessionId: string;
  inviteToken: string;
  url: string;
}

export interface DraftHintsRequest {
  problemStatement: string;
  referenceAnswer: string;
  materials: Material[];
}

// ---------- Candidate (public) ----------

export interface AiPolicy {
  tier: Tier;
  maxHintLevel: number;
  allowedHelp: AllowedHelp;
  hintBudget: number;
  hintCosts: HintCosts;
}

export interface TakeSession {
  id: string;
  status: SessionStatus;
  candidateName: string | null;
  startedAt: string | null;
  answer: string;
  hintsUsed: number;
  hintPointsSpent: number;
  hintLevelUnlocked: number;
}

export interface TakeAssessment {
  title: string;
  role: string;
  domain: Domain;
  summary: string;
  timeLimitMinutes: number;
  problemStatement: string;
  materials: Material[];
  aiPolicy: AiPolicy;
}

export interface TakeView {
  session: TakeSession;
  assessment: TakeAssessment;
}

export interface Budget {
  hintsUsed: number;
  hintBudget: number;
  hintPointsSpent: number;
  nextHintLevel: number; // 0 if none left
  maxHintLevel: number;
}

export interface ChatResponse {
  candidateMessage: PublicMessage;
  reply: PublicMessage;
  budget: Budget;
}

export interface Health {
  ok: boolean;
  llmMode: 'live' | 'mock';
}
