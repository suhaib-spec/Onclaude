# apps/api — Hintwise API

## Purpose
NestJS + TypeORM (PostgreSQL) backend for Hintwise: interviewers build assessments and set AI guardrails; candidates
solve them with a **gated AI assistant**; interviewers review the transcript, an AI evaluation and AI-usage insights.
The contract is [`docs/mvp/MVP_SPEC.md`](../../docs/mvp/MVP_SPEC.md) (§2–§6).

## Run
```bash
# from the repo root (Windows, macOS, Linux)
npm run setup            # installs root, api and web
copy .env.example .env   # (cp on macOS/Linux) then optionally add ANTHROPIC_API_KEY
npm run dev:api          # http://localhost:3000/api  (watch mode)
npm --prefix apps/api run build && npm --prefix apps/api start   # compiled
npm --prefix apps/api test                                      # unit tests (policy engine, judge, leak checks)
```
- `.env` is read from the **repo root** (then the current folder). Without one, defaults from `.env.example` apply.
- The database named in `DATABASE_URL` is **created automatically** if missing; tables are synced by TypeORM.
- No `ANTHROPIC_API_KEY` (or `LLM_MODE=mock`) → **mock mode**. In live mode every LLM failure degrades to the mock logic.
- On first start (empty DB) the demo is seeded from `demo/`; `POST /api/demo/reset` wipes and reseeds.
- Startup prints one summary line: LLM mode, DB, seeded count and the demo URLs `/take/PRICING1`, `/take/ABTEST01`.

## Contents
| Path | What |
|---|---|
| `src/` | Application source — see [src/README.md](./src/README.md) |
| `package.json` | Scripts: `build`, `start`, `start:dev`, `test` (all cross-platform) |
| `nest-cli.json`, `tsconfig*.json` | Build config (`dist/` output, spec files excluded) |

## Key decisions
- **Built-in database fallback (T-019):** `src/config/embedded-db.ts` starts PGlite (with `uuid-ossp`) behind a local
  pglite-socket server when no Postgres answers at `DATABASE_URL` (`DB_MODE=auto`), or always with `DB_MODE=embedded`.
  Data lives in `<repo>/.data/pglite`. `DB_MODE=postgres` disables the fallback.
- **NestJS 11 + TypeORM 0.3 + TypeScript 5.9** (not the newest majors): NestJS 12 is ESM-only and TypeScript 7 breaks
  `ts-jest`/Nest CLI; the CommonJS 11.x line is the stable, proven choice for a time-boxed MVP.
- No auth (demo role switch in the UI); `synchronize: true` (MVP only).
- Candidate responses are built from **whitelists** in `src/candidate/public-view.ts`, unit-tested to never contain
  `referenceAnswer`, `rubric`, hint text beyond what the AI said, `forbiddenTerms` or `customRules`.

## Related tasks
T-018
