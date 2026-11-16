# apps/

## Purpose
The runnable applications of the Hintwise MVP.

## Contents
| Path | Description |
|---|---|
| [api/](./api/README.md) | NestJS + PostgreSQL backend: assessments, invites, the gated AI pipeline, evaluation and insights. |
| [web/](./web/README.md) | Angular frontend: the interviewer builder and review, and the candidate workspace with the AI helper. |

## Key decisions
- Independent apps (no npm workspaces) so each installs on its own; the root `package.json` orchestrates them.
- The contract between them is [`docs/mvp/MVP_SPEC.md`](../docs/mvp/MVP_SPEC.md).

## Related tasks
- T-018
