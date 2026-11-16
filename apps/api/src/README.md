# apps/api/src

## Purpose
Source of the Hintwise API. `main.ts` loads `.env`, auto-creates the database, boots Nest with prefix `/api`
and CORS for `http://localhost:4200`, then logs a one-line startup summary.

## Contents
| Path | What |
|---|---|
| `main.ts`, `app.module.ts` | Bootstrap and module wiring |
| [`config/`](./config/README.md) | Env loading, repo-root paths, database auto-create |
| [`common/`](./common/README.md) | Shared spec types and helpers |
| [`entities/`](./entities/README.md) | TypeORM entities: Assessment, Session, Message |
| [`ai/`](./ai/README.md) | The gated AI pipeline, evaluation and insights |
| [`assessments/`](./assessments/README.md) | Interviewer: assessment CRUD, draft hints, invites, session lists |
| [`sessions/`](./sessions/README.md) | Interviewer: session review and (re-)evaluation |
| [`candidate/`](./candidate/README.md) | Candidate `/take/:token` endpoints and public views |
| [`demo-data/`](./demo-data/README.md) | Seeder (`demo/` folder) and `POST /demo/reset` |
| [`health/`](./health/README.md) | `GET /health` → `{ok, llmMode}` |

## Key decisions
- Feature folders with plain services; one `AppModule` plus an `AiModule` keeps wiring obvious.
- `*.spec.ts` unit tests sit next to the code they test.

## Related tasks
T-018
