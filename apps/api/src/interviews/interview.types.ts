/** Shapes of the live AI interview (T-021). Mirrors docs/mvp/LIVE_INTERVIEW_SPEC.md exactly. */

export interface Competency {
  id: string;
  name: string;
  description: string;
  weight: number;
  jdQuote: string;
  keywords: string[];
}

export interface Question {
  id: string;
  competencyId: string;
  text: string;
  followUp: string;
}

export type Signal = 'strong' | 'ok' | 'weak';

export interface LiveScore {
  competencyId: string;
  score: number; // 1-5
  signal: Signal;
  evidence: string;
  reason: string;
}

export type TurnRole = 'interviewer' | 'candidate';
export type TurnKind = 'greeting' | 'question' | 'follow_up' | 'ack' | 'answer' | 'closing';

export interface Turn {
  id: string;
  role: TurnRole;
  kind: TurnKind;
  text: string;
  at: string;
  competencyId?: string;
  questionIndex?: number;
  liveScore?: LiveScore;
}

export interface CompetencyScore {
  competencyId: string;
  name: string;
  weight: number;
  score: number; // 0-5, 1 decimal
  jdQuote: string;
  evidence: string[];
  summary: string;
}

export type Recommendation = 'Strong hire' | 'Hire' | 'Lean no' | 'No hire';

export interface Scorecard {
  overall: number; // 0-100
  recommendation: Recommendation;
  cta: string;
  strengths: string[];
  concerns: string[];
  mock?: boolean;
}

export type InterviewStatus = 'in_progress' | 'completed';

export interface InterviewPlan {
  competencies: Competency[];
  questions: Question[];
}
