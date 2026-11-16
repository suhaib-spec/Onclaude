# src/assessments

## Purpose
Interviewer endpoints under `/api/assessments`: list (with `sessionCount`), get, create, update, delete,
`POST /draft-hints`, `POST /:id/invites`, `GET /:id/sessions`.

## Contents
| File | What |
|---|---|
| `assessments.controller.ts` | Routes (`draft-hints` declared before `:id`) |
| `assessments.service.ts` | Persistence, invite creation (8-char tokens), session summaries |
| `assessment-input.ts` | Validates/normalises bodies and fills guardrail defaults |

## Key decisions
- Deleting an assessment also deletes its sessions and messages.
- Missing guardrail fields get safe defaults (standard tier, all help allowed, budget 4, costs 2/4/6/10).

## Related tasks
T-018
