# src/sessions

## Purpose
Interviewer review: `GET /api/sessions/:id` (session, assessment incl. rubric + reference answer, messages with full meta)
and `POST /api/sessions/:id/evaluate` (re-runs evaluation + insights).

## Contents
| File | What |
|---|---|
| `sessions.controller.ts` | Routes |
| `sessions.service.ts` | Review payload; evaluation runner (also used in the background after submit) |

## Key decisions
- `POST /:id/evaluate` returns the review payload `{session, assessment, messages}` **plus** the session's fields at the
  top level, so either reading of "returns the session" works.
- Background evaluation uses `setImmediate`; failures are logged, never thrown to the candidate.

## Related tasks
T-018
