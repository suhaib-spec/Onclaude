# src/demo-data

## Purpose
Seeds the demo from the repo-root `demo/` folder and exposes `POST /api/demo/reset`.

## Contents
| File | What |
|---|---|
| `seeder.service.ts` | On start (if no assessments): `demo/assessments/*.json` → assessments (`isDemo`), every `demo/sessions/*.json` file → evaluated sessions + messages, then fixed invites `PRICING1` (domain `business`) and `ABTEST01` (domain `data`) |
| `demo.controller.ts` | `POST /demo/reset`: truncates all tables and reseeds |

## Key decisions
- Missing/empty/invalid demo files are logged and skipped; the API still starts.
- Seeded messages without timestamps are spread across the session's start→submit window, preserving order.

## Related tasks
T-018
