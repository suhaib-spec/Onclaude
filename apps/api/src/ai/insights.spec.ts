import { Message } from '../entities';
import { analyseHintPattern, computeAiUsageScore, computeStats } from './insights';

const t0 = new Date('2026-01-01T10:00:00Z').getTime();
const msg = (intent: string, minute: number) =>
  ({ role: 'candidate', content: intent, createdAt: new Date(t0 + minute * 60000), meta: { intent, decision: 'answer' } }) as unknown as Message;
const session = (hintsUsed: number) => ({ startedAt: new Date(t0), submittedAt: new Date(t0 + 30 * 60000), hintsUsed, hintPointsSpent: 0, hintLevelUnlocked: hintsUsed }) as any;

function score(msgs: Message[], hints: number) {
  const s = session(hints);
  return computeAiUsageScore(computeStats(s, msgs), analyseHintPattern(s, msgs));
}

describe('AI collaboration score', () => {
  it('does not penalise hints taken after effort', () => {
    const effortful = [msg('clarify', 4), msg('hint_request', 6), msg('concept', 8), msg('hint_request', 10)];
    expect(score(effortful, 2)).toBeGreaterThanOrEqual(70);
  });

  it('penalises back-to-back hints with no attempt in between', () => {
    const lazy = [msg('hint_request', 0), msg('hint_request', 1), msg('hint_request', 1)];
    expect(score(lazy, 3)).toBeLessThan(70);
  });

  it('penalises repeated solution requests more than a single one, and injections', () => {
    const once = score([msg('solution_request', 5)], 0);
    const thrice = score([msg('solution_request', 5), msg('solution_request', 6), msg('solution_request', 7)], 0);
    expect(thrice).toBeLessThan(once);
    expect(score([msg('injection', 5)], 0)).toBe(55);
  });

  it('rewards clarifying, concept and hypothesis-testing questions', () => {
    expect(score([msg('clarify', 3), msg('concept', 5), msg('hypothesis_check', 9)], 0)).toBe(80);
  });
});
