# AGENTS.md — Foundational Rules for This Repository

> **Every AI agent, session, or assistant working on this repository MUST read this file first and follow it.**
> These rules come from the project owner (Suhaib) and override any default habits of the agent.
> Only the project owner may change these rules, and every change must be logged as a task in [`TASKS.md`](./TASKS.md).

---

## 1. What this project is

**AI-Assisted Coding Interview Trainer** — a tool that helps interviewees prepare for and practice
*AI-assisted* coding interviews (interviews where candidates are expected to work alongside AI coding tools).

Product scope, features, and tech stack are defined task by task. Nothing is assumed until a task specifies it.

---

## 2. Required reading order (start of every session)

1. **`AGENTS.md`** (this file) — the rules.
2. **[`TASKS.md`](./TASKS.md)** — every task ever requested, its status, and its history.
3. **`README.md` files** along the folder path you are about to touch — they describe what each folder/feature is and why it exists.

Do not change anything before completing these three steps.

---

## 3. All work happens through tasks

- **No change is made unless it was requested as a task** by the project owner.
- Every task gets an ID (`T-001`, `T-002`, …) and an entry in [`TASKS.md`](./TASKS.md) **before** any code is written.
- A task is not "done" until its log entry, the relevant `README.md` files, and the push are all complete.

---

## 4. Task lifecycle (follow in order)

| Step | What to do |
|---|---|
| **1. Log** | Add the task to `TASKS.md` with status `Proposed`, exactly as the owner described it. |
| **2. Conflict check** | Compare the new task against **every** existing task (active and done) and the current code. Does it contradict, undo, or overlap anything? |
| **3. Stop on conflict** | If there is any conflict, **do not proceed**. Explain the conflict to the owner — which tasks, what clashes — and let the owner decide. Record the decision in the task entry. |
| **4. Research** | Investigate what the task needs: existing code, libraries, best practices, current docs. |
| **5. Clarify** | Ask the owner every question needed to reach **at least 95% confidence** about what to build. Never fill gaps with silent assumptions. Record questions and answers in the task entry. |
| **6. Build** | Implement the task. Set status to `In Progress`. |
| **7. Document** | Create or update the `README.md` of every folder the task touched (see §5). Reorganize the structure if needed (see §6). |
| **8. Close** | Fill in the task's summary, files changed, and set status to `Done`. |
| **9. Push** | Commit and push directly to `main` (see §7). |

Questions may be asked **at any step** — asking is always preferred over guessing.

---

## 5. Documentation hierarchy (`README.md` in every folder)

Every folder in the repository has its own `README.md` that describes that level of the hierarchy:

- **Purpose** — what this folder / feature is for.
- **Contents** — the files and sub-folders in it, one line each, with links to sub-folder `README.md`s.
- **Key decisions** — important design choices and why they were made.
- **Related tasks** — the task IDs that created or changed this folder.

The root [`README.md`](./README.md) is the top of the hierarchy and links downward. A reader should be able to start
at the root and navigate to any feature by following `README.md` links.

---

## 6. Keep the structure growing with the project

- As tasks accumulate, **evolve the folder and documentation structure** to stay readable and maintainable:
  group related code into feature folders, split large files, and add `README.md`s for new levels.
- Any restructuring is described in the task that caused it and reflected in the affected `README.md`s.
- When `TASKS.md` gets long (roughly 50+ completed tasks), move completed tasks into
  `tasks/archive/` (e.g. `tasks/archive/2026-11.md`) and keep `TASKS.md` as the index plus active tasks.

---

## 7. Git rules

- The owner has given **standing permission** to commit and push **directly to `main`** once a task is complete.
- **One commit per task** (or a small number of clearly-labelled commits), with the task ID in the message:
  `T-007: Add problem bank loader`.
- **Never** force-push, rewrite history, or delete branches.
- **Never** open pull requests unless the owner explicitly asks.
- **Never** commit or push anything that is not part of an owner-requested task.
- Never commit secrets (API keys, tokens, `.env` files).

---

## 8. Communication

- Ask questions whenever something is unclear — at any point in a task.
- Surface conflicts, risks, and limitations to the owner immediately rather than working around them.
- When a task is finished, report briefly: what changed, where, and the commit.

---

## 9. Changing these rules

Only the project owner can change this file. Such a change is itself a task, logged in `TASKS.md`,
and is checked for conflicts with existing tasks like any other.
