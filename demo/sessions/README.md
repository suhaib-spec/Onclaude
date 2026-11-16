# demo/sessions/

## Purpose
Pre-baked, evaluated candidate sessions so the interviewer review page can be demoed instantly. Format: the session seed format in [MVP_SPEC §6](../../docs/mvp/MVP_SPEC.md); `assessmentTitle` links each file to its assessment.

## Contents
| File | Description |
|---|---|
| `pricing-session.json` | Priya Raman, token `DEMOPR01`: the strong AI user. Right price, but forgot the payment fee; 75 − 3 hint points = **72**; AI collaboration 78; asked for the answer once; integrity flags 0. |
| `pricing-weak-session.json` | Jordan Lee, token `DEMOPR02`: the over-reliant contrast. Asked for the answer 3 times, one trick attempt, all 4 hints back to back; recommends the trap price $14; 37 − 19 = **18**; AI collaboration 25; integrity flags 1. |
| `abtest-session.json` | Daniel Osei, token `DEMOAB01`: right call (don't ship), but no formal traffic-split test; 78 − 3 = **75**; AI collaboration 73; one trick attempt (integrity flags 1). |

## Key decisions
- Candidate messages have `meta: null`; the classified intent, decision, hint level/cost and judge verdict sit on the assistant reply's `meta`.
- Each transcript (12–16 messages) has one reply with the checker verdict `rewritten` (with reasons) so the 🛡 badge appears.
- `integrityFlags` counts **only attempts to trick the AI** (injections). Asking for the answer is normal behaviour under pressure:
  it shows up as a behaviour note and in `stats.solutionRequests`, not as an integrity flag (buyer-judge review, T-018).
- Priya vs Jordan is the demo's "two memos" moment: same case and AI, opposite ways of using it.
- All user-facing text (assistant replies) is in plain English: "Hint 2 of 4 (−3 points)", not level codes.
- Insight stats are computed from the transcript by the generator; `aiUsageScore` uses the heuristic documented in the script (70, +6 per clarify/method/idea-check question, −6 per request for the answer, −15 per trick attempt, −4 per hint taken straight after another hint).

## Related tasks
- T-018
