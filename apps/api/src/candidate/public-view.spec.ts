import { Assessment, Message, Session } from '../entities';
import { toBudget, toPublicMessage, toTakeView } from './public-view';

const assessment = {
  id: 'a1',
  title: 'T',
  role: 'R',
  domain: 'data',
  summary: 'S',
  timeLimitMinutes: 30,
  problemStatement: 'P',
  materials: [{ id: 'm', name: 'data.csv', kind: 'csv', content: 'a,b' }],
  referenceAnswer: 'SECRET_REFERENCE',
  rubric: [{ id: 'r', name: 'SECRET_RUBRIC', description: 'd', weight: 100 }],
  guardrails: {
    tier: 'strict',
    allowedHelp: { clarify: true, concepts: true, methods: true, materials: true, strategy: true },
    hintLadder: [{ level: 1, text: 'SECRET_HINT_TEXT' }],
    hintBudget: 3,
    hintCosts: { 1: 1, 2: 2, 3: 3, 4: 4 },
    forbiddenTerms: ['SECRET_TERM'],
    customRules: 'SECRET_RULES',
  },
  isDemo: false,
  createdAt: new Date(),
} as unknown as Assessment;

const session = {
  id: 's1',
  status: 'in_progress',
  candidateName: 'C',
  startedAt: new Date(),
  answer: '',
  hintsUsed: 0,
  hintPointsSpent: 0,
  hintLevelUnlocked: 0,
  integrityFlags: 0,
  evaluation: { summary: 'SECRET_EVAL' },
} as unknown as Session;

const SECRETS = ['SECRET_REFERENCE', 'SECRET_RUBRIC', 'SECRET_HINT_TEXT', 'SECRET_TERM', 'SECRET_RULES', 'SECRET_EVAL', 'referenceAnswer', 'rubric', 'hintLadder', 'forbiddenTerms', 'customRules', 'integrityFlags'];

describe('candidate public views never leak protected data', () => {
  it('take view', () => {
    const json = JSON.stringify(toTakeView(session, assessment));
    for (const s of SECRETS) expect(json).not.toContain(s);
    expect(JSON.parse(json).assessment.aiPolicy.maxHintLevel).toBe(1); // strict, capped by a 1-step ladder
  });

  it('messages expose only decision / hintLevel / hintCost', () => {
    const m = {
      id: 'x',
      role: 'assistant',
      content: 'hi',
      createdAt: new Date(),
      meta: { intent: 'injection', decision: 'decline', judge: { verdict: 'fallback', reasons: ['SECRET_TERM'], deterministicHits: [] } },
    } as unknown as Message;
    const pub = toPublicMessage(m);
    expect(pub.meta).toEqual({ decision: 'decline' });
    expect(JSON.stringify(pub)).not.toContain('SECRET_TERM');
  });

  it('budget', () => {
    expect(toBudget(session, assessment)).toEqual({ hintsUsed: 0, hintBudget: 3, hintPointsSpent: 0, nextHintLevel: 1, maxHintLevel: 1 });
  });
});
