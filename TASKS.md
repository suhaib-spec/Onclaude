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

---

## Active tasks

_None._

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
