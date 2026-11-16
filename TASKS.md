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
| T-018 | MVP: interviewer-built assessments with a gated AI assistant + 2 demo use cases | MVP | In Progress | 2026-11-16 | — |

---

## Active tasks

### T-018 — MVP: interviewer-built assessments with a gated AI assistant + 2 demo use cases
- **Status:** In Progress
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
