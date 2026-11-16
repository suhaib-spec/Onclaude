import {
  Competency,
  CompetencyScore,
  InterviewPlan,
  LiveScore,
  Question,
  Recommendation,
  Scorecard,
  Signal,
} from './interview.types';

/**
 * Deterministic "interviewer brain" used when no API key is set, and as the fallback for every live-mode failure.
 * It is tuned for the demo JD (Product Analyst at Quillstone) but works for any JD.
 */

// ---------------------------------------------------------------------------------------------------------------------
// Demo JD
// ---------------------------------------------------------------------------------------------------------------------

export const DEMO_JD = {
  jobTitle: 'Product Analyst',
  company: 'Quillstone',
  jobDescription: [
    'Quillstone is an AI meeting-notes startup that helps 40,000 teams turn conversations into decisions. We are hiring a Product Analyst who sits between product, sales and finance.',
    '',
    'What you will do',
    '- Turn product and usage data into decisions the team can act on.',
    '- Run and read A/B tests and pricing experiments, from hypothesis to rollout.',
    '- Work with product, sales and finance to prioritise what we build next.',
    '- Present clear recommendations to leadership, with the trade-offs spelled out.',
    '',
    'What we are looking for',
    '- Strong SQL and spreadsheet skills; comfortable with messy event data.',
    '- Experience designing experiments: hypotheses, sample sizes and guardrail metrics.',
    '- Business sense: unit economics, churn, LTV and what drives them.',
    '- Clear communication with non-technical stakeholders.',
    '- You use AI tools responsibly to move faster, and you check their work.',
  ].join('\n'),
};

interface CompetencyFlavour {
  strength: string; // "a strong, data-driven decision-maker"
  probe: string; // "how they pick the metric that matters"
}

const DEMO_COMPETENCIES: Competency[] = [
  {
    id: 'data-decisions',
    name: 'Data-driven decisions',
    description: 'Uses product and usage data (SQL, spreadsheets, AI tools checked with care) to change what the team does.',
    weight: 30,
    jdQuote: 'Turn product and usage data into decisions the team can act on.',
    keywords: ['sql', 'query', 'queries', 'dashboard', 'metric', 'metrics', 'data', 'usage', 'retention', 'cohort', 'cohorts', 'activation', 'funnel', 'segment', 'segmented', 'analysis', 'analysed', 'analyzed', 'spreadsheet', 'insight', 'decision', 'decided', 'trend', 'kpi', 'events', 'ai', 'chatgpt', 'claude', 'checked', 'verified', 'dropped', 'increased'],
  },
  {
    id: 'experimentation',
    name: 'Experimentation',
    description: 'Designs and reads A/B tests and pricing experiments: hypothesis, metric, sample size, guardrails, decision.',
    weight: 25,
    jdQuote: 'Run and read A/B tests and pricing experiments, from hypothesis to rollout.',
    keywords: ['a/b', 'ab test', 'a/b test', 'experiment', 'experiments', 'hypothesis', 'control', 'variant', 'treatment', 'sample', 'sample size', 'significance', 'significant', 'power', 'guardrail', 'p-value', 'confidence', 'rollout', 'rolled out', 'pricing', 'conversion', 'randomised', 'randomized', 'holdout', 'test', 'tested', 'primary metric'],
  },
  {
    id: 'business-acumen',
    name: 'Business acumen',
    description: 'Understands unit economics, churn and LTV and turns them into revenue-aware recommendations.',
    weight: 25,
    jdQuote: 'Business sense: unit economics, churn, LTV and what drives them.',
    keywords: ['churn', 'ltv', 'cac', 'unit economics', 'revenue', 'arr', 'mrr', 'margin', 'pricing', 'retention', 'cohort', 'payback', 'plan', 'seats', 'upgrade', 'downgrade', 'cost', 'customers', 'accounts', 'segment', 'expansion', 'onboarding', 'root cause', 'impact'],
  },
  {
    id: 'communication',
    name: 'Communication & stakeholders',
    description: 'Explains findings simply to non-technical people and leadership, handles pushback, and lands a decision.',
    weight: 20,
    jdQuote: 'Present clear recommendations to leadership, with the trade-offs spelled out.',
    keywords: ['stakeholder', 'stakeholders', 'leadership', 'sales', 'finance', 'ceo', 'vp', 'presented', 'explained', 'aligned', 'pushback', 'pushed back', 'trade-off', 'trade-offs', 'recommendation', 'story', 'simple', 'chart', 'one-pager', 'concern', 'concerns', 'buy-in', 'listened', 'agreed', 'convinced', 'meeting'],
  },
];

const DEMO_QUESTIONS: Question[] = [
  {
    id: 'q1',
    competencyId: 'data-decisions',
    text: 'Tell me about a time you used product or usage data to change a decision your team was about to make. What did the data show, and what happened next?',
    followUp: 'Which metric actually moved the decision, roughly by how much, and what did the team end up doing differently?',
  },
  {
    id: 'q2',
    competencyId: 'experimentation',
    text: 'Walk me through an A/B test or pricing experiment you designed or analysed. How did you set it up, and how did you decide what to ship?',
    followUp: 'What was your hypothesis and primary metric, how big was the sample or how long did it run, and what result made you call it?',
  },
  {
    id: 'q3',
    competencyId: 'business-acumen',
    text: 'Say Quillstone\'s monthly churn on the Team plan climbs from 3% to 5% over a quarter. How would you work out why, and what would you recommend?',
    followUp: 'Where would you look first, and how would you size the hit to revenue or LTV before recommending a fix?',
  },
  {
    id: 'q4',
    competencyId: 'communication',
    text: 'Tell me about a time you had to win over a non-technical stakeholder, or leadership, on a recommendation they first pushed back on.',
    followUp: 'What exactly was the pushback, how did you change your message, and how did it end?',
  },
];

const DEMO_FLAVOUR: Record<string, CompetencyFlavour> = {
  'data-decisions': { strength: 'a data-driven decision-maker', probe: 'how they choose the metric that matters' },
  experimentation: { strength: 'a rigorous experimenter', probe: 'experiment design when traffic is low' },
  'business-acumen': { strength: 'sharp on unit economics', probe: 'pricing and churn trade-offs' },
  communication: { strength: 'a clear communicator', probe: 'stakeholder pushback' },
};

/** True when the JD is (close to) the demo JD, so the hand-written rubric applies. */
export function isDemoJd(jobDescription: string, company = ''): boolean {
  const t = `${company} ${jobDescription}`.toLowerCase();
  return t.includes('quillstone') || (t.includes('a/b') && t.includes('ltv') && t.includes('stakeholder'));
}

// ---------------------------------------------------------------------------------------------------------------------
// Plan (competencies + questions) for any JD
// ---------------------------------------------------------------------------------------------------------------------

const STOP = new Set(
  'about above after again also and any are because been before being both but can could did does doing down during each few for from further had has have having her here him his how into its itself just more most other our out over own same she should some such than that the their them then there these they this those through too under until very was were what when where which while who whom why will with would you your yours we us team role work working able strong experience including across using within new help ensure must etc'.split(
    ' ',
  ),
);

const GENERIC_BLUEPRINT: { id: string; name: string; description: string; weight: number; keywords: string[]; q: (title: string) => string; followUp: string; flavour: CompetencyFlavour }[] = [
  {
    id: 'role-expertise',
    name: 'Role expertise',
    description: 'Hands-on depth in the core skills this job description asks for.',
    weight: 30,
    keywords: ['built', 'designed', 'delivered', 'shipped', 'owned', 'tool', 'tools', 'process', 'system', 'project', 'data', 'results', 'improved', 'reduced', 'increased'],
    q: (title) => `Tell me about the piece of work you are proudest of that is closest to what a ${title} does here. What did you personally do, and what changed because of it?`,
    followUp: 'What was your specific part in it, and how did you know it worked? Any numbers you can share?',
    flavour: { strength: 'strong hands-on expertise', probe: 'depth in the core skills of the role' },
  },
  {
    id: 'problem-solving',
    name: 'Problem solving',
    description: 'Breaks down messy problems, weighs options and makes sound calls with incomplete information.',
    weight: 25,
    keywords: ['problem', 'root cause', 'options', 'trade-off', 'trade-offs', 'hypothesis', 'tested', 'analysed', 'analyzed', 'prioritised', 'prioritized', 'decided', 'because', 'risk', 'constraint', 'data'],
    q: () => 'Tell me about a hard problem you faced where the right answer was not obvious. How did you break it down, and what did you decide?',
    followUp: 'Which options did you consider, and what made you pick the one you did?',
    flavour: { strength: 'a structured problem solver', probe: 'judgement under ambiguity' },
  },
  {
    id: 'collaboration',
    name: 'Collaboration & ownership',
    description: 'Works across teams, takes ownership and gets things done with others.',
    weight: 25,
    keywords: ['team', 'cross-functional', 'collaborated', 'partnered', 'owned', 'ownership', 'aligned', 'conflict', 'disagreed', 'helped', 'mentored', 'deadline', 'delivered', 'together'],
    q: () => 'Tell me about a time you had to work closely with another team to deliver something under pressure. What was your role, and how did it go?',
    followUp: 'What got in the way, and what did you personally do to unblock it?',
    flavour: { strength: 'a dependable collaborator', probe: 'ownership when things go wrong' },
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Explains ideas clearly to different audiences and brings people along.',
    weight: 20,
    keywords: ['explained', 'presented', 'stakeholder', 'stakeholders', 'leadership', 'audience', 'simple', 'clear', 'convinced', 'feedback', 'listened', 'pushback', 'recommendation', 'story', 'agreed'],
    q: () => 'Tell me about a time you had to convince someone senior, or non-technical, to change their mind. How did you approach it?',
    followUp: 'What was their objection, and what did you change in your message to land it?',
    flavour: { strength: 'a clear communicator', probe: 'handling pushback from senior people' },
  },
];

function jdSentences(jd: string): string[] {
  return jd
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((s) => s.split(/\s+/).length >= 4);
}

function topJdTerms(jd: string, n: number): string[] {
  const counts = new Map<string, number>();
  for (const w of jd.toLowerCase().match(/[a-z][a-z/+#-]{3,}/g) ?? []) {
    if (STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

/** Builds the 4 competencies (weights sum to 100, each with a verbatim JD quote) and 4 questions with follow-ups. */
export function mockPlan(jobTitle: string, company: string, jobDescription: string): InterviewPlan {
  if (isDemoJd(jobDescription, company)) {
    const sentences = jdSentences(jobDescription);
    const competencies = DEMO_COMPETENCIES.map((c) => ({
      ...c,
      keywords: [...c.keywords],
      // Keep the quote verbatim from THIS JD (the user may have edited it).
      jdQuote: jobDescription.includes(c.jdQuote) ? c.jdQuote : bestQuote(sentences, c.keywords) || c.jdQuote,
    }));
    return { competencies, questions: DEMO_QUESTIONS.map((q) => ({ ...q })) };
  }
  const sentences = jdSentences(jobDescription);
  const jdTerms = topJdTerms(jobDescription, 10);
  const used = new Set<string>();
  const competencies: Competency[] = GENERIC_BLUEPRINT.map((b, i) => {
    const keywords = i === 0 ? [...jdTerms, ...b.keywords] : [...b.keywords];
    const free = sentences.filter((s) => !used.has(s));
    const quote = bestQuote(free, keywords) || free[0] || sentences[i] || jobDescription.slice(0, 120).trim();
    used.add(quote);
    return { id: b.id, name: b.name, description: b.description, weight: b.weight, jdQuote: quote, keywords };
  });
  const title = jobTitle || 'person in this role';
  const questions: Question[] = GENERIC_BLUEPRINT.map((b, i) => ({ id: `q${i + 1}`, competencyId: b.id, text: b.q(title), followUp: b.followUp }));
  return { competencies, questions };
}

function bestQuote(sentences: string[], keywords: string[]): string {
  let best = '';
  let bestHits = 0;
  for (const s of sentences) {
    const hits = keywordHits(s, keywords).length;
    if (hits > bestHits) {
      best = s;
      bestHits = hits;
    }
  }
  return best;
}

export function flavourFor(c: Competency): CompetencyFlavour {
  return (
    DEMO_FLAVOUR[c.id] ??
    GENERIC_BLUEPRINT.find((b) => b.id === c.id)?.flavour ?? { strength: `strong on ${c.name.toLowerCase()}`, probe: c.name.toLowerCase() }
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------------------------------------------------

const STRUCTURE = [/\bi led\b/i, /\bas a result\b/i, /\bbecause\b/i, /\bfirst\b[\s\S]*\bthen\b/i, /\bthe outcome\b/i, /\bresult(ed)? in\b/i, /\bso we\b/i, /\bi decided\b/i, /\bwhich meant\b/i];
const VAGUE = [/\bi don'?t know\b/i, /\bnot sure\b/i, /\bno idea\b/i, /\bi guess\b/i, /\bnever done\b/i, /\bhaven'?t (really )?(done|had)\b/i];
const NUMBER = /(\$\s?\d[\d,.]*\s?[kmb]?|\d[\d,.]*\s?(%|percent|x\b|k\b|pp\b)|\d[\d,.]*)/i;

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}

export function keywordHits(text: string, keywords: string[]): string[] {
  const hits: string[] = [];
  for (const k of keywords) {
    const re = new RegExp(`(^|[^a-z0-9])${escapeRe(k.toLowerCase())}(?=$|[^a-z0-9])`, 'i');
    if (re.test(text) && !hits.includes(k)) hits.push(k);
  }
  return hits;
}

export function wordCount(text: string): number {
  return (text.trim().match(/\S+/g) ?? []).length;
}

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function clip(text: string, max = 25): string {
  const words = text.trim().split(/\s+/);
  return words.length <= max ? text.trim() : `${words.slice(0, max).join(' ')}…`;
}

export function signalOf(score: number): Signal {
  return score >= 4 ? 'strong' : score >= 3 ? 'ok' : 'weak';
}

/** The candidate's sentence with the most competency keywords (numbers break ties), verbatim, ≤ 25 words. */
export function pickEvidence(answer: string, keywords: string[]): string {
  const sents = sentencesOf(answer);
  if (!sents.length) return '';
  let best = sents[0];
  let bestScore = -1;
  for (const s of sents) {
    const sc = keywordHits(s, keywords).length * 2 + (NUMBER.test(s) ? 1 : 0);
    if (sc > bestScore) {
      best = s;
      bestScore = sc;
    }
  }
  return clip(best);
}

export interface AnswerFeatures {
  words: number;
  hasNumber: boolean;
  keywords: string[];
  structured: boolean;
  vague: boolean;
}

export function features(answer: string, c: Competency): AnswerFeatures {
  return {
    words: wordCount(answer),
    hasNumber: /\d|%|\$/.test(answer),
    keywords: keywordHits(answer, c.keywords),
    structured: STRUCTURE.some((r) => r.test(answer)),
    vague: VAGUE.some((r) => r.test(answer)),
  };
}

export function mockScore(answer: string, c: Competency): LiveScore {
  const f = features(answer, c);
  let s = 2;
  if (f.words >= 40) s += 1;
  if (f.hasNumber) s += 1;
  if (f.keywords.length >= 2) s += 1;
  if (f.structured) s += 0.5;
  if (f.words < 12 || f.vague) s -= 1;
  const score = Math.max(1, Math.min(5, s));
  return { competencyId: c.id, score, signal: signalOf(score), evidence: pickEvidence(answer, c.keywords), reason: reasonFor(f, score) };
}

function reasonFor(f: AnswerFeatures, score: number): string {
  const good: string[] = [];
  const gaps: string[] = [];
  if (f.hasNumber) good.push('puts numbers on the impact');
  else gaps.push('no numbers');
  if (f.keywords.length >= 2) good.push(`covers ${f.keywords.slice(0, 2).join(' and ')}`);
  else gaps.push('little that maps to this skill');
  if (f.structured) good.push('explains the why and the outcome');
  else if (f.words >= 12) gaps.push('outcome not spelled out');
  if (f.words < 12) gaps.unshift('very short');
  else if (f.words < 40) gaps.push('could use a concrete example');
  if (f.vague) gaps.unshift('hedged or unsure');
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (score >= 4) return `${cap(good.join(', '))}.`;
  if (score >= 3) return `${cap(good[0] ?? 'on topic')}, but ${gaps.slice(0, 2).join(' and ') || 'thin on detail'}.`;
  return `${cap(gaps.slice(0, 3).join(', ') || 'too general')}.`;
}

/** Weak or very short answer → ask the follow-up (once per question). */
export function needsFollowUp(answer: string, live: LiveScore): boolean {
  return live.score <= 2 || wordCount(answer) < 12;
}

// ---------------------------------------------------------------------------------------------------------------------
// Conversation lines
// ---------------------------------------------------------------------------------------------------------------------

export function greeting(candidateName: string, jobTitle: string, company: string): string {
  const first = firstName(candidateName);
  return `Hi ${first}, thanks for joining. I'm the AI interviewer for the ${jobTitle} role at ${company}: four questions, about 15 minutes, and specific examples beat perfect answers.`;
}

export function closing(candidateName: string, company: string, early = false): string {
  const first = firstName(candidateName);
  return early
    ? `Let's stop there, ${first}. Thanks for your time; the ${company} team will follow up on next steps.`
    : `That's all my questions, ${first}. Thanks, this was genuinely useful; the ${company} team will be in touch about next steps.`;
}

export function firstName(name: string): string {
  return (name || 'there').trim().split(/\s+/)[0] || 'there';
}

const FOLLOW_LEADS = ['Let me push on that a little.', "I'd love a bit more detail.", 'Can you make that more concrete?', 'Let me dig in there.'];

export function followUpText(q: Question, index: number, answer: string): string {
  const lead = wordCount(answer) < 12 ? FOLLOW_LEADS[(index + 1) % FOLLOW_LEADS.length] : FOLLOW_LEADS[index % FOLLOW_LEADS.length];
  return `${lead} ${q.followUp}`;
}

/** Pulls "12% churn drop" style phrases out of an answer. */
export function numberPhrase(answer: string): string | null {
  const re = /(\$\s?\d[\d,.]*[kmb]?|\d[\d,.]*(?:%|\s?percent|pp|x\b|k\b)?(?:-[a-z]+)?)((?:\s+[A-Za-z][A-Za-z-]*){0,3})/gi;
  const STOPS = ['and', 'but', 'which', 'so', 'because', 'that', 'we', 'i', 'it', 'they', 'was', 'were', 'is', 'with', 'after', 'to', 'roughly', 'cuts', 'cut', 'means', 'meant', 'would', 'will', 'could', 'has', 'had', 'have', 'are', 'be', 'when', 'while', 'if', 'or'];
  const TRAIL = ['in', 'of', 'on', 'the', 'a', 'for', 'from', 'by', 'over', 'than', 'at', 'next', 'our', 'about'];
  const found: { phrase: string; tail: number; rich: boolean }[] = [];
  for (const m of answer.matchAll(re)) {
    const num = m[1].trim().replace(/[.,]$/, '');
    const kept: string[] = [];
    for (const w of (m[2] ?? '').trim().split(/\s+/).filter(Boolean)) {
      if (STOPS.includes(w.toLowerCase())) break;
      kept.push(w);
    }
    while (kept.length && TRAIL.includes(kept[kept.length - 1].toLowerCase())) kept.pop();
    found.push({ phrase: `${num}${kept.length ? ' ' + kept.join(' ') : ''}`, tail: kept.length, rich: /[%$]|percent|k\b/i.test(num) });
  }
  if (!found.length) return null;
  const pick = found.find((f) => f.rich && f.tail) ?? found.find((f) => f.tail) ?? found[0];
  return pick.phrase;
}

const ACK_NUMBER = [
  (p: string) => `Good, quantifying it ("${p}") makes that concrete.`,
  (p: string) => `Helpful. "${p}" is exactly the kind of evidence I look for.`,
  (p: string) => `Nice, "${p}" gives me a clear sense of the impact.`,
  (p: string) => `Thanks, anchoring it in "${p}" makes that easy to follow.`,
];
const ACK_KEYWORD = [
  (k: string) => `Thanks, I like that you brought ${k} into it.`,
  (k: string) => `Got it; the way you used ${k} there is clear.`,
  (k: string) => `Makes sense, and the point about ${k} is a useful lens.`,
  (k: string) => `Understood, thinking in terms of ${k} is the right instinct here.`,
];
const ACK_PLAIN = ['Thanks for walking me through that.', 'Understood, thank you.', 'Okay, thanks for being candid.', 'Got it, thanks.'];

const BRIDGES = [
  (n: string) => `Next, let's talk about ${n}.`,
  (n: string) => `Let's switch to ${n}.`,
  (n: string) => `Moving on to ${n}.`,
  (n: string) => `Now a question on ${n}.`,
];

/** A short reaction that references something the candidate actually said, plus a bridge to the next topic. */
export function mockAck(answer: string, c: Competency, index: number, next?: Competency): string {
  const num = numberPhrase(answer);
  const kws = keywordHits(answer, c.keywords).filter((k) => k.length > 2 && !['data', 'test', 'plan', 'ai'].includes(k));
  let line: string;
  const numHasContext = !!num && /\s/.test(num) && /[%$]|percent/i.test(num);
  if (num && numHasContext) line = ACK_NUMBER[index % ACK_NUMBER.length](num);
  else if (kws.length) line = ACK_KEYWORD[index % ACK_KEYWORD.length](displayKeyword(kws[0]));
  else line = ACK_PLAIN[index % ACK_PLAIN.length];
  return next ? `${line} ${BRIDGES[index % BRIDGES.length](next.name.toLowerCase())}` : line;
}

function displayKeyword(k: string): string {
  const upper: Record<string, string> = { ltv: 'LTV', cac: 'CAC', sql: 'SQL', arr: 'ARR', mrr: 'MRR', kpi: 'KPIs', 'a/b': 'A/B testing', 'a/b test': 'the A/B test', 'ab test': 'the A/B test', ceo: 'the CEO', vp: 'the VP' };
  return upper[k] ?? k;
}

// ---------------------------------------------------------------------------------------------------------------------
// Rubric roll-up and scorecard
// ---------------------------------------------------------------------------------------------------------------------

export function summaryFor(c: Competency, score: number, answered: boolean): string {
  if (!answered) return 'Not covered yet.';
  if (score >= 4.5) return 'Excellent: specific, quantified and clearly owned.';
  if (score >= 4) return 'Strong: concrete example with a measurable outcome.';
  if (score >= 3) return 'Solid, but light on specifics or results.';
  if (score >= 2) return 'Thin: general statements, little evidence.';
  return 'No real evidence yet.';
}

export function overallOf(scores: CompetencyScore[]): number {
  const total = scores.reduce((s, c) => s + c.weight, 0) || 1;
  const avg = scores.reduce((s, c) => s + c.score * c.weight, 0) / total;
  return Math.round(avg * 20);
}

export function recommendationOf(overall: number): Recommendation {
  return overall >= 80 ? 'Strong hire' : overall >= 65 ? 'Hire' : overall >= 50 ? 'Lean no' : 'No hire';
}

export function mockScorecard(competencies: Competency[], scores: CompetencyScore[]): Scorecard {
  const overall = overallOf(scores);
  const recommendation = recommendationOf(overall);
  const byScore = [...scores].sort((a, b) => b.score - a.score || b.weight - a.weight);
  const top = byScore[0];
  const low = [...scores].sort((a, b) => a.score - b.score || b.weight - a.weight)[0];
  const comp = (id: string) => competencies.find((c) => c.id === id)!;
  const topF = flavourFor(comp(top.competencyId));
  const lowF = flavourFor(comp(low.competencyId));
  const probe = low.competencyId === top.competencyId ? 'depth with a live case' : lowF.probe;

  let cta: string;
  if (recommendation === 'Strong hire') cta = `Advance to final round: ${topF.strength}; probe ${probe} in the panel.`;
  else if (recommendation === 'Hire') cta = `Advance to next round: ${topF.strength}; probe ${probe} with a short live case.`;
  else if (recommendation === 'Lean no') cta = `Hold for now: only ${top.name.toLowerCase()} stood out; re-screen on ${probe} before advancing.`;
  else cta = `Do not advance: answers lacked concrete evidence, especially on ${low.name.toLowerCase()}.`;

  const strengths = byScore
    .filter((s) => s.score >= 4)
    .map((s) => `${s.name}: ${s.evidence[0] ? `"${s.evidence[0]}"` : s.summary}`);
  const concerns = [...scores]
    .sort((a, b) => a.score - b.score)
    .filter((s) => s.score < 3.5)
    .map((s) => (s.evidence.length ? `${s.name}: ${s.summary.toLowerCase().replace(/^\w/, (m) => m.toUpperCase())}` : `${s.name}: not covered in the interview.`));
  if (!concerns.length) concerns.push(`No major gaps; confirm ${lowF.probe} in the next round.`);
  if (!strengths.length) strengths.push(top.score > 0 ? `${top.name} was the strongest area (${top.score}/5).` : 'No clear strengths shown yet.');
  return { overall, recommendation, cta, strengths, concerns, mock: true };
}

// ---------------------------------------------------------------------------------------------------------------------
// Seed: one completed, strong demo interview
// ---------------------------------------------------------------------------------------------------------------------

export const MAYA_CHEN_ANSWERS: string[] = [
  'At Loopwise I noticed in our usage data that teams who connected a calendar in week one retained far better. I wrote the SQL to build weekly cohorts and found 30-day retention was 68% for calendar-connected teams versus 41% for the rest. Product was about to spend the quarter on a new editor, so I presented the cohort analysis and argued for fixing onboarding first. As a result we moved calendar setup into the signup flow, activation rose from 52% to 71% and the editor slipped one sprint.',
  'I led a pricing experiment on our Pro plan. The hypothesis was that an annual-first checkout would lift paid conversion without hurting refunds. We randomised 12,000 new trials 50/50 between control and variant, set paid conversion as the primary metric and refund rate as a guardrail, and agreed the sample size up front so nobody peeked early. After three weeks the variant converted 9% better with 95% confidence and refunds stayed flat, so we rolled it out to everyone.',
  'First I would check whether the jump is real or a billing artefact, then segment churn by cohort, company size and seats, because a rise like that usually sits in one segment. Then I would look at usage before cancelling, for example teams whose meetings stopped syncing. Going from 3% to 5% monthly roughly cuts expected lifetime from 33 to 20 months, so LTV drops by about 40%, which is worth a dedicated fix. My recommendation would target the segment driving it, say small teams after a price change, with a retention offer and an onboarding fix, and track churn monthly.',
  'Our head of sales pushed back on removing the free tier; he worried pipeline would dry up. I listened to his concerns, then rebuilt the analysis around his own metric and showed that free users created very few sales-qualified leads but a big share of support costs. I put it in one simple chart and proposed a trial instead, with a check-in after six weeks. He agreed, and leadership approved the trade-off.',
];
