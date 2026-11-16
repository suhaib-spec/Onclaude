import { Decision, Domain, Intent, SessionStatus } from '../core/api.models';

export const DOMAIN_LABEL: Record<Domain, string> = {
  business: 'Business',
  data: 'Data & Stats',
  coding: 'Coding',
  math: 'Math',
  other: 'Other',
};

export const DOMAIN_ICON: Record<Domain, string> = {
  business: '📈',
  data: '📊',
  coding: '💻',
  math: '∑',
  other: '✦',
};

export const INTENT_LABEL: Record<Intent, string> = {
  clarify: 'Asked to clarify',
  concept: 'Asked a concept',
  method: 'Asked about a method',
  materials: 'Asked about the materials',
  strategy: 'Asked for an approach',
  hypothesis_check: 'Checked a guess',
  hint_request: 'Asked for a hint',
  solution_request: 'Asked for the answer',
  injection: 'Tried to trick the AI',
  off_topic: 'Off-topic',
};

/** good = healthy AI use, warn = neutral-but-costly, bad = integrity concern */
export const INTENT_TONE: Record<Intent, 'good' | 'neutral' | 'warn' | 'bad'> = {
  clarify: 'good',
  concept: 'good',
  method: 'good',
  materials: 'good',
  strategy: 'good',
  hypothesis_check: 'neutral',
  hint_request: 'warn',
  solution_request: 'bad',
  injection: 'bad',
  off_topic: 'neutral',
};

export const DECISION_LABEL: Record<Decision, string> = {
  answer: 'Helped',
  hint: 'Gave a hint',
  decline: 'Said no',
  redirect: 'Told them to test it',
};

export const STATUS_LABEL: Record<SessionStatus, string> = {
  invited: 'Invited',
  in_progress: 'In progress',
  submitted: 'Submitted',
  evaluated: 'Evaluated',
};

export const HELP_INFO: { key: 'clarify' | 'concepts' | 'methods' | 'materials' | 'strategy'; label: string; desc: string }[] = [
  { key: 'clarify', label: 'Clarify the question', desc: 'Explain what the brief is asking and define terms.' },
  { key: 'concepts', label: 'Explain concepts', desc: 'Teach the underlying ideas (e.g. profit margin, statistical significance).' },
  { key: 'methods', label: 'Explain methods & tools', desc: 'Describe how a method or tool works, in general terms.' },
  { key: 'materials', label: 'Walk through the materials', desc: 'Show where the relevant information lives in the files.' },
  { key: 'strategy', label: 'Suggest an approach', desc: 'Help structure the work and plan next steps.' },
];

export const LEVEL_INFO: Record<number, { name: string; desc: string }> = {
  1: { name: 'Nudge', desc: 'A gentle nudge about how to approach the problem.' },
  2: { name: 'Where to look', desc: 'Points to the part of the materials worth a closer look.' },
  3: { name: 'Key idea', desc: 'Names the key idea that unlocks the problem.' },
  4: { name: 'Pinpoint', desc: 'Pinpoints exactly where the crux is (never the answer).' },
};

export function relTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso).getTime();
  const s = Math.round((Date.now() - d) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** "Hint 2 · Where to look" */
export function hintName(level: number | null | undefined): string {
  const l = Number(level) || 0;
  return LEVEL_INFO[l] ? `Hint ${l} · ${LEVEL_INFO[l].name}` : `Hint ${l}`;
}

export const TIER_LABEL: Record<'strict' | 'standard', string> = {
  strict: 'Interview mode (tighter)',
  standard: 'Practice mode (more help)',
};
