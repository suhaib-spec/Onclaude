import { Guardrails } from '../common/types';
import { decide, nextHintLevel, SessionCounters } from './policy-engine';

const guardrails = (over: Partial<Guardrails> = {}): Guardrails => ({
  tier: 'standard',
  allowedHelp: { clarify: true, concepts: true, methods: true, materials: true, strategy: false },
  hintLadder: [
    { level: 1, text: 'L1 text' },
    { level: 2, text: 'L2 text' },
    { level: 3, text: 'L3 text' },
    { level: 4, text: 'L4 text' },
  ],
  hintBudget: 3,
  hintCosts: { 1: 2, 2: 4, 3: 6, 4: 10 },
  forbiddenTerms: [],
  customRules: '',
  ...over,
});
const fresh: SessionCounters = { hintLevelUnlocked: 0, hintsUsed: 0, hintPointsSpent: 0, integrityFlags: 0 };

describe('policy engine', () => {
  it('answers allowed help types', () => {
    const d = decide('concept', guardrails(), fresh);
    expect(d.decision).toBe('answer');
    expect(d.counters).toEqual(fresh);
  });

  it('declines help types the interviewer disabled', () => {
    const d = decide('strategy', guardrails(), fresh);
    expect(d.decision).toBe('decline');
    expect(d.kind).toBe('help_not_allowed');
  });

  it('redirects hypothesis checks without changing counters', () => {
    const d = decide('hypothesis_check', guardrails(), fresh);
    expect(d.decision).toBe('redirect');
    expect(d.counters).toEqual(fresh);
  });

  it('unlocks the next hint, charges its cost and only passes steps up to that level', () => {
    const d = decide('hint_request', guardrails(), { ...fresh, hintLevelUnlocked: 1, hintsUsed: 1, hintPointsSpent: 2 });
    expect(d.decision).toBe('hint');
    expect(d.hintLevel).toBe(2);
    expect(d.hintCost).toBe(4);
    expect(d.instruction).toContain('hint 2 of 4');
    expect(d.counters).toMatchObject({ hintLevelUnlocked: 2, hintsUsed: 2, hintPointsSpent: 6 });
    expect(d.unlockedHints.map((h) => h.level)).toEqual([1, 2]);
  });

  it('declines hints when the budget is exhausted', () => {
    const d = decide('hint_request', guardrails(), { ...fresh, hintLevelUnlocked: 3, hintsUsed: 3 });
    expect(d.kind).toBe('hint_budget_exhausted');
    expect(d.counters.hintsUsed).toBe(3);
  });

  it('caps strict tier at level 3', () => {
    const g = guardrails({ tier: 'strict', hintBudget: 10 });
    const d = decide('hint_request', g, { ...fresh, hintLevelUnlocked: 3, hintsUsed: 3 });
    expect(d.kind).toBe('hint_max_level');
    expect(nextHintLevel(g, { ...fresh, hintLevelUnlocked: 3, hintsUsed: 3 })).toBe(0);
    expect(d.unlockedHints.some((h) => h.level === 4)).toBe(false);
  });

  it('flags only injections as integrity issues (solution requests are declined but not flagged)', () => {
    const sol = decide('solution_request', guardrails(), fresh);
    expect(sol.decision).toBe('decline');
    expect(sol.counters.integrityFlags).toBe(0);
    const inj = decide('injection', guardrails(), fresh);
    expect(inj.decision).toBe('decline');
    expect(inj.counters.integrityFlags).toBe(1);
  });

  it('never passes hint text beyond the unlocked level to the tutor', () => {
    const d = decide('concept', guardrails(), { ...fresh, hintLevelUnlocked: 1, hintsUsed: 1 });
    expect(d.unlockedHints.map((h) => h.text)).toEqual(['L1 text']);
  });
});
