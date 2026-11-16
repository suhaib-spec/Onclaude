import { Competency, CompetencyScore, Question } from './interview.types';

/** Live-mode prompts for the AI interviewer (T-021). Every caller falls back to mock-brain.ts on any failure. */

export const PLAN_SYSTEM = `You design structured, fair job interviews from a job description.
Return ONLY JSON: {"competencies":[{"id":"kebab-id","name":"...","description":"one sentence","weight":30,"jdQuote":"...","keywords":["..."]}],
"questions":[{"competencyId":"...","text":"...","followUp":"..."}]}
Rules: exactly 4 competencies whose weights sum to 100; each jdQuote is copied VERBATIM from the job description (one sentence or bullet);
8-20 lowercase keywords each that a strong answer would mention; exactly 4 questions, one per competency, behavioural or situational
("Tell me about a time…", "How would you…"), plain English, one or two sentences; each followUp asks for the missing specifics (numbers, own role, outcome).`;

export function planUserPrompt(jobTitle: string, company: string, jd: string): string {
  return `Job title: ${jobTitle}\nCompany: ${company}\n\nJob description:\n"""\n${jd}\n"""`;
}

export const TURN_SYSTEM = `You are a warm, sharp human-sounding interviewer. Score the candidate's latest answer against one competency and decide what to say next.
Return ONLY JSON: {"score":1-5,"evidence":"the candidate's single most relevant sentence, copied verbatim, max 25 words","reason":"short plain-English why (max 15 words)",
"askFollowUp":true|false,"ack":"one short sentence reacting to something specific the candidate said (a number or idea they used)"}
Scoring: 5 = specific, quantified, clearly owned, outcome stated; 3 = relevant but general; 1 = vague, off-topic or "I don't know".
Set askFollowUp true only when the answer is weak or very short AND a follow-up is allowed. Never reveal scores or give the answer. No jargon.`;

export function turnUserPrompt(p: { competency: Competency; question: string; answer: string; followUpAllowed: boolean }): string {
  return `Competency: ${p.competency.name} — ${p.competency.description}\nJD line: "${p.competency.jdQuote}"\nQuestion asked: ${p.question}\nFollow-up allowed: ${p.followUpAllowed}\n\nCandidate answer:\n"""\n${p.answer}\n"""`;
}

export const SCORECARD_SYSTEM = `You write the interviewer's summary after a structured interview.
Return ONLY JSON: {"cta":"ONE line the interviewer can act on: the decision, the top strength, and what to probe next (max 22 words)",
"strengths":["max 3 short items, cite evidence"],"concerns":["max 3 short items"]}. The recommendation is given; stay consistent with it. Plain English.`;

export function scorecardUserPrompt(p: { jobTitle: string; recommendation: string; overall: number; scores: CompetencyScore[]; questions: Question[] }): string {
  const lines = p.scores.map((s) => `- ${s.name} (weight ${s.weight}): ${s.score}/5. Evidence: ${s.evidence.map((e) => `"${e}"`).join(' | ') || 'none'}`);
  return `Role: ${p.jobTitle}\nOverall: ${p.overall}/100 → ${p.recommendation}\nCompetency scores:\n${lines.join('\n')}`;
}
