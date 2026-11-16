# Hintwise: Help, not answers

An AI-assisted interview platform. **Interviewers** build an assessment for any role and set guardrails for an AI helper.
**Candidates** solve it with that helper, which explains, nudges and redirects but never gives the answer. Afterwards the
interviewer sees the answer, an AI evaluation against the rubric, and a report on how well the candidate used AI.

> 🤖 **AI agents:** read [AGENTS.md](./AGENTS.md) before doing anything.

## Run it locally (Windows, macOS or Linux)
Requirements: **Node 20+** and a running **PostgreSQL** (the database is created automatically).

```bash
npm run setup                 # installs root, api and web dependencies
copy .env.example .env        # Windows (macOS/Linux: cp .env.example .env)
# edit .env: set DATABASE_URL to your Postgres user/password, and ANTHROPIC_API_KEY (leave it empty for mock mode)
npm run dev                   # API on http://localhost:3000, web app on http://localhost:4200
```
Open **http://localhost:4200**. Demo links: `/take/PRICING1` (pricing case) and `/take/ABTEST01` (A/B-test case).
To reset the demo data: `POST http://localhost:3000/api/demo/reset` (e.g. `curl -X POST ...`).

## Contents
| Path | Description |
|---|---|
| [AGENTS.md](./AGENTS.md) | Foundational rules for every AI agent and contributor. |
| [CLAUDE.md](./CLAUDE.md) | Pointer to `AGENTS.md` for Claude-based tools. |
| [TASKS.md](./TASKS.md) | Task tracker and log: every change, requested and done. |
| [apps/](./apps/README.md) | The NestJS API and the Angular web app. |
| [demo/](./demo/README.md) | Demo assessments (pricing case, A/B test) and pre-baked candidate sessions. |
| [docs/](./docs/README.md) | Research, the game plan, the MVP spec, the demo script, and the judges'-panel reviews. |

## Key decisions
- All work is driven by tasks logged in `TASKS.md`; commits go directly to `main`, one per task.
- The AI gate is software, not just a prompt: an answer-blind helper, a rulebook written in code, and an answer checker
  that sees the answer key and blocks leaks (see `docs/research/02-gated-ai-design.md`).
- Mock mode (no API key) keeps the demo working offline.

## Related tasks
- T-000: Foundational rules, task log, and documentation structure
- T-001: Research & game plan
- T-018: MVP: interviewer-built assessments with a gated AI assistant + 2 demo use cases
