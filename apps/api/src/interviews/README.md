# src/interviews

## Purpose
The **live AI interview** (headline demo feature): an AI interviewer runs a short interview grounded in a job description,
asks a question, reacts (short acknowledgement or one follow-up) and moves on, while the interviewer sees a rubric built
from the JD with live scores, verbatim evidence and a one-line call to action. Contract: [`docs/mvp/LIVE_INTERVIEW_SPEC.md`](../../../../docs/mvp/LIVE_INTERVIEW_SPEC.md).

## Contents
| File | What |
|---|---|
| `interview.types.ts` | Competency, Question, Turn, LiveScore, CompetencyScore, Scorecard (exactly as in the spec) |
| `interview-session.entity.ts` | TypeORM entity `InterviewSession` → table `interview_sessions` (jsonb transcript/scores) |
| `interviews.service.ts` | Create/answer/finish/list logic, live-mode LLM calls with mock fallback, `seedDemo()` (Maya Chen) |
| `interviews.controller.ts` | `GET /interviews/demo-jd`, `GET/POST /interviews`, `GET /interviews/:id`, `POST /interviews/:id/answer`, `POST /interviews/:id/finish` |
| `mock-brain.ts` | Demo JD (Product Analyst at Quillstone), demo rubric + questions, generic plan for any JD, scoring heuristic, varied acks, scorecard/CTA, Maya Chen answers |
| `interview.prompts.ts` | Live-mode prompts: plan (competencies + questions), per-answer turn (score, evidence, ack, follow-up), scorecard |

## Key decisions
- **Mock first:** the demo runs without an API key, so `mock-brain.ts` is hand-tuned for the demo JD; any other JD gets a
  generic 4-competency plan with JD quotes picked by keyword overlap. In live mode every LLM failure (or invalid JSON) falls
  back to the mock, per call.
- **Grounding is enforced:** `jdQuote` must be verbatim in the JD and `evidence` verbatim in the candidate's answer; otherwise
  the deterministic pick is used.
- **Follow-ups:** at most one per question; the follow-up answer is scored together with the original answer, and a
  competency's score is the best answer score for it (a candidate can recover with prompting).
- **Overall / recommendation are deterministic** (weighted average × 20; ≥80 Strong hire, ≥65 Hire, ≥50 Lean no) even in
  live mode; the model only writes the CTA, strengths and concerns.
- Seeding: the completed "Maya Chen" interview is created by replaying scripted answers through the mock brain (on first
  start if the table is empty, and on `POST /api/demo/reset`).

## Related tasks
T-021
