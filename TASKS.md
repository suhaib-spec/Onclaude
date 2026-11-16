# TASKS.md — Task Tracker & Log

Every change to this repository is a task. This file tracks what was requested, what is in progress,
and what was done. Rules for using it are in [AGENTS.md](./AGENTS.md) §3–4.

**Statuses:** `Proposed` (awaiting owner approval) → `Approved` → `In Progress` → `Done`
· also `Blocked (conflict/question)` and `Cancelled`

---

## Index

| ID | Title | Phase | Status | Requested | Completed |
|---|---|---|---|---|---|
| T-000 | Foundational rules, task log, and documentation structure | 0 | Done | 2026-11-11 | 2026-11-11 |
| T-001 | Research & game plan | 0 | Done | 2026-11-11 | 2026-11-11 |
| T-002 | Monorepo skeleton, tooling & CI | 1 | Approved | — | — |
| T-003 | Challenge format spec & authoring guide | 1 | Approved | — | — |
| T-004 | First two challenges + challenge validator CI | 1 | Approved | — | — |
| T-005 | Database schema, migrations & auth | 1 | Approved | — | — |
| T-006 | Sandbox provider + session service | 1 | Approved | — | — |
| T-007 | Session UI (file tree, editor, tests, timer) | 1 | Approved | — | — |
| T-008 | Grading worker (hidden tests, isolated) | 1 | Approved | — | — |
| T-009 | Gated AI v1: tutor, intent classifier, policy engine | 2 | Approved | — | — |
| T-010 | Output judge (deterministic + LLM leak judge) | 2 | Approved | — | — |
| T-011 | Gate evaluation harness (red-team + benign sets) | 2 | Approved | — | — |
| T-012 | Telemetry & process metrics | 3 | Approved | — | — |
| T-013 | Scoring & evidence-linked debrief | 3 | Approved | — | — |
| T-014 | Challenge expansion (#5, #6, #4 + variants) | 4 | Approved | — | — |
| T-015 | Practice modes & 3-phase mock | 4 | Approved | — | — |
| T-016 | Skill tracking & recommender | 4 | Approved | — | — |
| T-017 | Deployment, cost guardrails & ops | 5 | Approved | — | — |
| T-018 | MVP: interviewer-built assessments with a gated AI assistant + 2 demo use cases | MVP | Done | 2026-11-16 | 2026-11-16 |
| T-019 | Run locally without PostgreSQL: built-in database fallback | MVP | Done | 2026-11-16 | 2026-11-16 |
| T-020 | PowerPoint deck, Word presenter script, and UI polish | MVP | Done | 2026-11-16 | 2026-11-16 |
| T-021 | Live AI Interview: JD-grounded interviewer, live rubric scores and one-line CTA | MVP | Done | 2026-11-16 | 2026-11-16 |
| T-022 | Human-like voice via Retell AI | MVP | Done | 2026-11-16 | 2026-11-16 |

---

## Active tasks

### T-022 — Human-like voice via Retell AI
- **Status:** Done
- **Requested:** 2026-11-16 by Suhaib: "Set up Retell AI's thing. I'll give you the API key and all the other stuff required",
  after asking for very human-like text-to-speech for Ava.
- **Conflict check:** Extends T-021 (voice). Note: a free neural-voice endpoint (`/api/tts`, msedge-tts) was added in T-021
  as a fallback-first option, but the Microsoft service reset connections on the owner's network, so the app falls back to
  browser voices.
- **Open questions for the owner:** Retell API key (to go in `.env`, never committed); create the Retell agent for you or
  use an existing agent ID; voice choice; whether Retell's own LLM runs the interview (prompted with our JD questions,
  scoring after/along the transcript) or our backend runs it as a custom LLM (needs a public URL/tunnel, since Retell
  must reach our server).
- **Answers:** Owner provided the Retell API key (stored only in the local `.env`, never committed) and asked me to set
  it up; voice `retell-Cimo` (owner's choice). Created a Retell LLM + agent "Ava – Hintwise Interviewer"
  (`agent_302d709b29d6c0ab2c1c70499b`) with the interview prompt; Retell's own LLM runs the call (no public URL needed).
- **Files changed:** `apps/api/src/interviews/interviews.{service,controller}.ts` (`POST /interviews/:id/voice/start`
  creates a Retell web call server-side; `POST /interviews/:id/voice/sync` mirrors Retell's live transcript, detects
  which question Ava is on, scores candidate turns, and builds the scorecard when the call ends), `apps/web` (Retell web
  SDK, "Start voice interview" button and live-call state in the stage view, `api.service.ts`), `.env.example`.
- **Verification:** API and web builds pass; simulated Retell transcript → questions detected, answers scored per
  skill, scorecard on end. Live call to be tested by the owner on their PC.


---

## Approved backlog

> Approved by the owner on 2026-11-11 (from the T-001 game plan). Each task still gets its own conflict check,
> research and clarifying questions when it is started. Remaining GAME_PLAN §10 decisions are asked in the task that needs them.

### T-002 — Monorepo skeleton, tooling & CI
- **Status:** Approved · **Phase 1**
- **Scope:** TypeScript monorepo (`apps/web` Angular, `apps/api` NestJS, `packages/shared` types, `challenges/`, `docs/`),
  lint/format/test tooling, GitHub Actions CI, `.env.example`, a `README.md` per folder.
- **Depends on:** decisions §10.2.

### T-003 — Challenge format spec & authoring guide
- **Status:** Approved · **Phase 1**
- **Scope:** `challenge.yaml` schema (JSON Schema + TS types) covering stack, brief, seeded issues (symptom / proximate /
  root cause, regions), red herrings, visible + hidden tests, reference patch, accepted alternatives, hint pack L1–L4,
  avoid-set, milestones, rubric, naive-fix traps. Plus an authoring guide (green-baseline → seed, no revealing history/comments).

### T-004 — First two challenges + challenge validator CI
- **Status:** Approved · **Phase 1** · **Depends on:** T-003
- **Scope:** Challenge #1 "Leaderboard drops the winner" (Python/FastAPI) and #2 "Cart total off by a cent" (TypeScript).
  Validator: seeded hidden tests fail, reference fix passes, naive fixes fail, flake check (5 runs).

### T-005 — Database schema, migrations & auth
- **Status:** Approved · **Phase 1** · **Depends on:** T-002
- **Scope:** PostgreSQL schema (users, challenges, sessions, session_events, test_runs, ai_messages, scores), migrations, auth.

### T-006 — Sandbox provider + session service
- **Status:** Approved · **Phase 1** · **Depends on:** T-002, T-004
- **Scope:** `SandboxProvider` interface with a local Docker adapter; session lifecycle (create from challenge template,
  file read/write, run visible tests, server-side deadline, destroy); WebSocket gateway.

### T-007 — Session UI
- **Status:** Approved · **Phase 1** · **Depends on:** T-006
- **Scope:** Angular session page: brief, file tree, Monaco editor, Run-tests panel, timer, submit; AI panel placeholder.

### T-008 — Grading worker
- **Status:** Approved · **Phase 1** · **Depends on:** T-006
- **Scope:** On submit/deadline: lock + snapshot workspace, run hidden tests in a fresh network-blocked sandbox,
  store results, basic results page. **Hidden tests never enter the candidate's sandbox.**

### T-009 — Gated AI v1
- **Status:** Approved · **Phase 2** · **Depends on:** T-006, T-003
- **Scope:** Answer-blind tutor with read-only repo tools; input guard; intent classifier over the conversation window;
  progress tracker (milestones from tests/telemetry); **deterministic policy engine** (request categories, hint ladder
  L0–L5, tiers, budgets, cooldowns, struggle-time floor, fading); spotlighting of repo content; `LlmProvider` interface.

### T-010 — Output judge
- **Status:** Approved · **Phase 2** · **Depends on:** T-009
- **Scope:** Deterministic layer (fingerprint similarity to the fix, avoid-set terms, code in issue regions, canary tokens,
  invisible-Unicode stripping) + answer-aware LLM leak judge + rewrite/fallback loop. Buffered replies for the MVP.

### T-011 — Gate evaluation harness
- **Status:** Approved · **Phase 2** · **Depends on:** T-010
- **Scope:** Red-team suite J1–J28, benign borderline set, automated adversarial candidate, metrics (leak rate,
  false-refusal, latency) and ship gates; regression run on every prompt/model change.

### T-012 — Telemetry & process metrics
- **Status:** Approved · **Phase 3** · **Depends on:** T-005, T-007
- **Scope:** Append-only event capture (edits, saves, test runs, pastes, AI turns, narration), anti-pattern detectors.

### T-013 — Scoring & evidence-linked debrief
- **Status:** Approved · **Phase 3** · **Depends on:** T-008, T-012
- **Scope:** Weighted rubric (correctness, root cause, verification, quality, AI collaboration, communication),
  rubric LLM judge, hint penalties, debrief page (diff, timeline, annotated AI transcript, reference fix + alternatives).

### T-014 — Challenge expansion
- **Status:** Approved · **Phase 4** · **Depends on:** T-004
- **Scope:** #5 invoices IDOR (NestJS+Postgres), #6 N+1/index perf, #4 React stale search; variant families; then the rest of the 15.

### T-015 — Practice modes & 3-phase mock
- **Status:** Approved · **Phase 4** · **Depends on:** T-009, T-013
- **Scope:** Learning / Timed mock / Full 3-phase mock (bug → feature → optimize, per-phase AI-off) / Review replay.

### T-016 — Skill tracking & recommender
- **Status:** Approved · **Phase 4** · **Depends on:** T-013
- **Scope:** Skill tags, mastery estimates, interleaved next-challenge picks, spaced re-tests with renamed variants.

### T-017 — Deployment, cost guardrails & ops
- **Status:** Approved · **Phase 5**
- **Scope:** Hosting, managed sandbox provider, rate limits, per-user cost caps, Langfuse tracing, data retention.

---

## Completed tasks

### T-021 — Live AI Interview: JD-grounded interviewer, live rubric scores and one-line CTA
- **Status:** Done
- **Requested:** 2026-11-16 by Suhaib: turn the demo into a live interview session based on a job description. For the
  candidate, the AI asks a question, waits for the response and responds to whatever they say. For the interviewer, build
  a proper rubric grounded in the job description from the candidate's answers, give scores, and a one-line call to
  action. Intuitive, dynamic, engaging UI for a 5-minute proof-of-concept demo.
- **Conflict check:** Changes the demo focus set in T-018 (async case solving with a gated helper). Raised with the owner;
  **resolved: add it as the headline mode and keep the case flow as a backup demo** (no removal).
- **Questions & answers:** Scope → add as the headline mode. Demo JD → Product / Business Analyst. API key → none; make
  the scripted (mock) mode as convincing as possible for the demo JD.
- **Research notes:** Spec: [`docs/mvp/LIVE_INTERVIEW_SPEC.md`](./docs/mvp/LIVE_INTERVIEW_SPEC.md).
- **Files changed:** `apps/api/src/interviews/` (new module: entity, service, controller, mock interviewer, prompts),
  `apps/api/src/{app.module.ts,entities/index.ts,demo-data/seeder.service.ts,README.md}`,
  `apps/web/src/app/features/interview/` (new: JD form, live stage view, rubric card, typewriter, live list),
  `apps/web/src/app/{app.routes.ts,core/api.*.ts,features/landing,features/interviewer/dashboard}`, `docs/mvp/LIVE_INTERVIEW_SPEC.md`.
- **Verification:** API tests 41/41 and both builds pass; full mock interview (strong answer, weak answer triggering a
  follow-up, three more answers) ends at 97 / Strong hire with a one-line CTA; stage view screenshot checked.
- **Summary:** AI interviewer "Ava" interviews against a JD (demo: Product Analyst at Quillstone), asks 4 questions with
  follow-ups on thin answers, reacts to what the candidate said, and scores each answer live against a 4-skill rubric
  built from the JD (JD quote + verbatim evidence). The interviewer gets an overall score, a recommendation and a
  one-line call to action. Split-screen stage view for the demo; voice in/out where the browser supports it. Lead fix
  after integration: a skill's score is the average of best and mean (a follow-up recovers some, not all), and evidence
  quotes come from the newest answer.
- **Follow-up fixes (owner feedback, 2026-11-16 17:15):** Claude-style answer bar (focus glow, round mic and send
  buttons, auto-growing input); the mic keeps listening through pauses and shows live text and a waveform, with clear
  messages if the mic is blocked; Ava's voice on by default with a natural voice where available (spoken after the
  first click if the browser blocks autoplay); interviewer replies stream in word by word; the stage no longer overflows
  on wide screens.

### T-020 — PowerPoint deck, Word presenter script, and UI polish
- **Status:** Done
- **Requested:** 2026-11-16 by Suhaib ("make the ppt file and a script in docx for the ppt and keep it simple … and make
  the UI much better"); clarified: improve **both** the app UI and the slides' design.
- **Conflict check:** Builds on T-018 (UI, pitch content). No conflicts.
- **Files changed:** `docs/pitch/` (new: deck, script, generator, README), `docs/README.md`, `apps/web/src/styles.scss`,
  `apps/web/src/app/features/candidate/take/take.{html,scss}`, `apps/web/src/app/features/interviewer/review/review.scss`,
  `apps/web/src/app/features/candidate/README.md`.
- **Verification:** deck passes the pptx validator and was checked slide by slide as rendered images; script checked as PDF; web build passes;
  UI checked with before/after screenshots and on the owner's PC.
- **Summary:** Redesigned 11-slide deck in plain English; ~5½-minute presenter script; visual polish pass on the app
  (one design system, "Held the line" shield on refused answers, guarded helper panel, cleaner review page). No
  behaviour or API changes.

### T-019 — Run locally without PostgreSQL: built-in database fallback
- **Status:** Done
- **Requested:** 2026-11-16 by Suhaib ("I haven't set up anything for Postgres, can you build and set it up")
- **Request:** Make the MVP run on the owner's Windows PC, which has no PostgreSQL installed.
- **Conflict check:** T-018 chose "Node + my own PostgreSQL". This keeps Postgres as the primary option and adds a
  fallback only when no server answers, so there is no conflict; the owner asked for it directly.
- **Questions & answers:** Postgres not installed → owner chose to have it built and set up.
- **Files changed:** `apps/api/src/config/embedded-db.ts` (new), `apps/api/src/main.ts`, `apps/api/package.json`
  (+ `@electric-sql/pglite`, `@electric-sql/pglite-socket`), `package.json` (`dev` builds then starts the API: the
  `nest --watch` runner stalled on Windows), `.env.example` (`DB_MODE`), `.gitignore` (`.data`), READMEs.
- **Verification:** API tests and build pass; with `DB_MODE=embedded` the API seeds 2 assessments + 3 sessions and the
  demo chat flow works.
- **Summary:** `DB_MODE=auto` (default) uses Postgres when reachable, otherwise starts PGlite (with `uuid-ossp`) behind
  pglite-socket on 127.0.0.1:54329, with data in `.data/pglite`. Also noted that the web app needs Node 22.22+ or 24.15+.

### T-018 — MVP: interviewer-built assessments with a gated AI assistant + 2 demo use cases
- **Status:** Done
- **Requested:** 2026-11-16 by Suhaib
- **Request:** Start building. Ask every question the game plan needs, finalize requirements, then build at least an MVP.
  The AI agent assists interviewees: it answers their questions about the interviewer's problem statement without giving
  the answer outright, so candidates learn to use AI to solve role-specific assessments. **Interviewers use the platform
  to build their own questions and specify the AI's guardrails.** Not limited to coding: also mathematical and other job
  domains where AI is useful. Prepare **two demo stories/problem statements** with the AI ready to assist in both.
  Use subagents to get it done properly.
- **Conflict check:** Conflicts with the approved roadmap (T-001 game plan, T-002–T-017) and AGENTS.md §1:
  1. *Domain:* the plan and AGENTS.md §1 are coding-only (browser IDE, sandbox, hidden tests); this asks for multi-domain.
  2. *Authoring:* the plan has us authoring coding challenges as files validated by CI (T-003/T-004); this asks for
     interviewers to author questions and guardrails in the platform.
  3. *Order:* the plan builds the coding environment first (Phase 1) and the AI second (Phase 2); this asks for an MVP
     with the AI assistant and two demos now.
  → Raised with the owner; **resolved: run both in parallel.** The MVP is the domain-agnostic platform; the coding IDE track
  (T-002–T-017) stays on the roadmap as a parallel track. AGENTS.md §1 updated to match.
- **Research notes:** Builds on `docs/research/02-gated-ai-design.md` (answer-blind tutor, deterministic policy engine,
  answer-aware judge, hint ladder). Contract: [`docs/mvp/MVP_SPEC.md`](./docs/mvp/MVP_SPEC.md).
- **Questions & answers (2026-11-16):**
  - Plan conflict? → **Both in parallel**: generic MVP now, coding track continues separately.
  - Candidate workspace? → Brief + materials + answer editor + AI chat; **no code execution** in the MVP.
  - Interview flow? → **Async invite link**; the interviewer reviews afterwards.
  - Interviewer review? → Annotated AI transcript, final answer, AI evaluation vs rubric, AI-usage insights (all four).
  - Demo use cases? → **Business case: pricing decision** and **Data/stats: A/B test trap**.
  - Interviewer guardrails? → Strictness preset + hint ladder, protected answer + forbidden terms, allowed help types,
    hint budget/costs + custom rules (all four).
  - LLM? → **Anthropic Claude** (key in local `.env`); mock mode when no key so the demo never breaks (agent decision).
  - Where it runs? → **Locally: Node + the owner's own PostgreSQL**.
  - Accounts? → **No auth; demo role switch**.
  - Deadline? → Demo to judges in ~2.5 h: must look good; also prepare a demo script + presentation and have a panel of
    agents review the project.
  - Agent decisions under time pressure (owner unavailable for more rounds): product name "Hintwise"; buffered judge
    (reply shown after the check); tutor `claude-sonnet-5-5`, judge `claude-haiku-5-5`; TypeORM `synchronize` instead of
    migrations; no npm workspaces (independent apps).
- **Files changed:** root `package.json`, `.env.example`, `.gitignore`, `README.md`, `AGENTS.md` §1, `apps/` (new: `api/` NestJS,
  `web/` Angular, with READMEs), `demo/` (2 assessments, 3 pre-baked sessions, generator script), `docs/mvp/` (spec, demo script,
  pitch content), `docs/review/` (judges'-panel and red-team reviews), `TASKS.md`.
- **Reviews run:** business panel on the pitch (investor, HR buyer, story coach), then on the live product (business judges,
  QA walkthrough in headless Chrome, red-team of the AI gate: 24 probes, 0 answer leaks). Findings applied; see `docs/review/00-panel-summary.md`.
- **Verification:** API 41/41 tests pass; API and web builds pass; demo-script chat messages checked against the running API (mock mode).
- **Summary:** Built the Hintwise MVP: interviewers build assessments for any role and set AI guardrails (mode, help types,
  hint levels, budget, blocked phrases, answer key, extra instructions); candidates solve via an invite link with a gated AI
  helper (answer-blind tutor + rules in code + answer checker; mock mode without an API key); the review page shows the score
  with reasons, how the candidate used AI, and an annotated transcript. Two demo cases (Quillstone pricing; Harbor & Pine A/B
  test) and a pitch deck (Claude Slides: https://claude.ai/artifact/McCKN8tP5HZf1qYRkYBWUG).
- **Follow-ups (not started):** run the demo once in live mode with a real API key; the coding IDE track (T-002–T-017) continues as planned.

### T-001 — Research & game plan for the AI-assisted coding interview trainer
- **Status:** Done
- **Requested:** 2026-11-11 by Suhaib
- **Request:** Build a trainer for *AI-assisted coding interviews*: the candidate is handed an existing project/set of files
  with known issues and must resolve them using a **gated AI assistant**. The assistant must never give the answer or any
  form of it, but may help with instructions unrelated to the answer and may redirect a candidate who is heading in an
  unproductive direction. It should be neither too open nor too linear. Research the domain heavily (interview formats,
  gated-AI design, common real-world app problems, training strategies), use multiple agents to form a game plan,
  break it into tasks, and **get the owner's approval before building anything**.
- **Conflict check:** Only T-000 exists (rules/docs). No conflict.
- **Research notes:** Four parallel research agents produced [`docs/research/01–04`](./docs/research/README.md)
  (interview formats, gated-AI design, challenge design, architecture/stack). Synthesised into
  [`docs/plan/GAME_PLAN.md`](./docs/plan/GAME_PLAN.md).
- **Questions & answers:**
  - Approve the game plan and T-002–T-017? → **Approved as-is** (2026-11-11).
  - Tech stack? → **Angular + NestJS + PostgreSQL**, one TypeScript monorepo.
  - Challenge languages at launch? → **Python + TypeScript**.
  - Gate openness? → **Strict (max L3) + Standard (max L4, may name file/function) + Debrief (L5)** tiers first.
  - Other GAME_PLAN §10 decisions (audience, LLM key, sandbox provider, judge UX, terminal, verification-training mode,
    hint-penalty visibility, session lengths) → deferred to the task that needs them.
- **Files changed:** `docs/README.md`, `docs/research/*`, `docs/plan/*`, `TASKS.md`, `README.md`
- **Summary:** Research complete; game plan approved; tasks T-002–T-017 approved as the roadmap.

### T-000 — Foundational rules, task log, and documentation structure
- **Status:** Done
- **Requested:** 2026-11-11 by Suhaib
- **Request:** Set up the foundational expectations for every agent working on this project: a main rules document,
  a task tracking/logging file, and a per-folder `README.md` hierarchy that grows with the project.
  Every change is requested as a task; the agent checks for conflicts, researches, asks questions, builds, and pushes to the repo.
- **Conflict check:** First task — nothing to conflict with.
- **Questions & answers:**
  - Push policy? → Commit and push directly to `main` after each completed task.
  - Main doc name? → `AGENTS.md` holds the rules; `CLAUDE.md` points to it.
  - Also keep a copy in the claude.ai Project? → Yes; the repo is the source of truth.
- **Files changed:** `AGENTS.md`, `CLAUDE.md`, `TASKS.md`, `README.md`
- **Summary:** Created the rules document, this task log, and the root `README.md` as the top of the documentation hierarchy.

---

## Task entry template

Copy this for each new task:

```markdown
### T-XXX — <short title>
- **Status:** Proposed
- **Requested:** YYYY-MM-DD by <name>
- **Request:** <the task as described by the owner>
- **Conflict check:** <tasks reviewed; conflicts found or "none">
- **Research notes:** <findings, links, options considered>
- **Questions & answers:**
  - <question> → <answer>
- **Files changed:** <list>
- **Summary:** <what was done>
- **Commit:** <hash>
```
