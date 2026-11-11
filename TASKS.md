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
| T-001 | Research & game plan | 0 | Awaiting approval | 2026-11-11 | — |
| T-002 | Monorepo skeleton, tooling & CI | 1 | Proposed | — | — |
| T-003 | Challenge format spec & authoring guide | 1 | Proposed | — | — |
| T-004 | First two challenges + challenge validator CI | 1 | Proposed | — | — |
| T-005 | Database schema, migrations & auth | 1 | Proposed | — | — |
| T-006 | Sandbox provider + session service | 1 | Proposed | — | — |
| T-007 | Session UI (file tree, editor, tests, timer) | 1 | Proposed | — | — |
| T-008 | Grading worker (hidden tests, isolated) | 1 | Proposed | — | — |
| T-009 | Gated AI v1: tutor, intent classifier, policy engine | 2 | Proposed | — | — |
| T-010 | Output judge (deterministic + LLM leak judge) | 2 | Proposed | — | — |
| T-011 | Gate evaluation harness (red-team + benign sets) | 2 | Proposed | — | — |
| T-012 | Telemetry & process metrics | 3 | Proposed | — | — |
| T-013 | Scoring & evidence-linked debrief | 3 | Proposed | — | — |
| T-014 | Challenge expansion (#5, #6, #4 + variants) | 4 | Proposed | — | — |
| T-015 | Practice modes & 3-phase mock | 4 | Proposed | — | — |
| T-016 | Skill tracking & recommender | 4 | Proposed | — | — |
| T-017 | Deployment, cost guardrails & ops | 5 | Proposed | — | — |

---

## Active tasks

### T-001 — Research & game plan for the AI-assisted coding interview trainer
- **Status:** Awaiting approval
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
- **Questions & answers:** Open decisions listed in GAME_PLAN §10. _Awaiting owner answers._
- **Files changed:** `docs/README.md`, `docs/research/*`, `docs/plan/*`, `TASKS.md`, `README.md`
- **Summary:** Research complete; game plan and proposed tasks T-002–T-017 drafted for approval.

---

## Proposed tasks (awaiting owner approval)

> These come from the T-001 game plan. Each will get a full conflict check, research and clarifying questions when
> it's started. Scope may be refined once the GAME_PLAN §10 decisions are answered.

### T-002 — Monorepo skeleton, tooling & CI
- **Status:** Proposed · **Phase 1**
- **Scope:** TypeScript monorepo (`apps/web` Angular, `apps/api` NestJS, `packages/shared` types, `challenges/`, `docs/`),
  lint/format/test tooling, GitHub Actions CI, `.env.example`, a `README.md` per folder.
- **Depends on:** decisions §10.2.

### T-003 — Challenge format spec & authoring guide
- **Status:** Proposed · **Phase 1**
- **Scope:** `challenge.yaml` schema (JSON Schema + TS types) covering stack, brief, seeded issues (symptom / proximate /
  root cause, regions), red herrings, visible + hidden tests, reference patch, accepted alternatives, hint pack L1–L4,
  avoid-set, milestones, rubric, naive-fix traps. Plus an authoring guide (green-baseline → seed, no revealing history/comments).

### T-004 — First two challenges + challenge validator CI
- **Status:** Proposed · **Phase 1** · **Depends on:** T-003
- **Scope:** Challenge #1 "Leaderboard drops the winner" (Python/FastAPI) and #2 "Cart total off by a cent" (TypeScript).
  Validator: seeded hidden tests fail, reference fix passes, naive fixes fail, flake check (5 runs).

### T-005 — Database schema, migrations & auth
- **Status:** Proposed · **Phase 1** · **Depends on:** T-002
- **Scope:** PostgreSQL schema (users, challenges, sessions, session_events, test_runs, ai_messages, scores), migrations, auth.

### T-006 — Sandbox provider + session service
- **Status:** Proposed · **Phase 1** · **Depends on:** T-002, T-004
- **Scope:** `SandboxProvider` interface with a local Docker adapter; session lifecycle (create from challenge template,
  file read/write, run visible tests, server-side deadline, destroy); WebSocket gateway.

### T-007 — Session UI
- **Status:** Proposed · **Phase 1** · **Depends on:** T-006
- **Scope:** Angular session page: brief, file tree, Monaco editor, Run-tests panel, timer, submit; AI panel placeholder.

### T-008 — Grading worker
- **Status:** Proposed · **Phase 1** · **Depends on:** T-006
- **Scope:** On submit/deadline: lock + snapshot workspace, run hidden tests in a fresh network-blocked sandbox,
  store results, basic results page. **Hidden tests never enter the candidate's sandbox.**

### T-009 — Gated AI v1
- **Status:** Proposed · **Phase 2** · **Depends on:** T-006, T-003
- **Scope:** Answer-blind tutor with read-only repo tools; input guard; intent classifier over the conversation window;
  progress tracker (milestones from tests/telemetry); **deterministic policy engine** (request categories, hint ladder
  L0–L5, tiers, budgets, cooldowns, struggle-time floor, fading); spotlighting of repo content; `LlmProvider` interface.

### T-010 — Output judge
- **Status:** Proposed · **Phase 2** · **Depends on:** T-009
- **Scope:** Deterministic layer (fingerprint similarity to the fix, avoid-set terms, code in issue regions, canary tokens,
  invisible-Unicode stripping) + answer-aware LLM leak judge + rewrite/fallback loop. Buffered replies for the MVP.

### T-011 — Gate evaluation harness
- **Status:** Proposed · **Phase 2** · **Depends on:** T-010
- **Scope:** Red-team suite J1–J28, benign borderline set, automated adversarial candidate, metrics (leak rate,
  false-refusal, latency) and ship gates; regression run on every prompt/model change.

### T-012 — Telemetry & process metrics
- **Status:** Proposed · **Phase 3** · **Depends on:** T-005, T-007
- **Scope:** Append-only event capture (edits, saves, test runs, pastes, AI turns, narration), anti-pattern detectors.

### T-013 — Scoring & evidence-linked debrief
- **Status:** Proposed · **Phase 3** · **Depends on:** T-008, T-012
- **Scope:** Weighted rubric (correctness, root cause, verification, quality, AI collaboration, communication),
  rubric LLM judge, hint penalties, debrief page (diff, timeline, annotated AI transcript, reference fix + alternatives).

### T-014 — Challenge expansion
- **Status:** Proposed · **Phase 4** · **Depends on:** T-004
- **Scope:** #5 invoices IDOR (NestJS+Postgres), #6 N+1/index perf, #4 React stale search; variant families; then the rest of the 15.

### T-015 — Practice modes & 3-phase mock
- **Status:** Proposed · **Phase 4** · **Depends on:** T-009, T-013
- **Scope:** Learning / Timed mock / Full 3-phase mock (bug → feature → optimize, per-phase AI-off) / Review replay.

### T-016 — Skill tracking & recommender
- **Status:** Proposed · **Phase 4** · **Depends on:** T-013
- **Scope:** Skill tags, mastery estimates, interleaved next-challenge picks, spaced re-tests with renamed variants.

### T-017 — Deployment, cost guardrails & ops
- **Status:** Proposed · **Phase 5**
- **Scope:** Hosting, managed sandbox provider, rate limits, per-user cost caps, Langfuse tracing, data retention.

---

## Completed tasks

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
