# Game Plan — AI-Assisted Coding Interview Trainer

> **Status:** DRAFT, awaiting owner approval (task T-001).
> **Basis:** four research reports in [`docs/research/`](../research/README.md), about 26k words and ~200 sources.
> Sections marked ⚠️ need an owner decision (§10).

---

## 1. What we're building, in one paragraph

A web app where a candidate gets a **realistic multi-file codebase someone else wrote**, with seeded problems
(bugs, a missing feature, a slow path). They work in a browser IDE with a test runner and a timer, and a side panel
holds a **gated AI assistant**. The assistant helps with everything except the answer. It explains tools, APIs and
concepts, tours the codebase and coaches debugging, and it uses a graduated hint ladder when the candidate is stuck
or heading the wrong way. It never writes, reveals, confirms or paraphrases the fix. At the end, hidden tests grade
the work and the candidate gets an **evidence-linked debrief** of their code, process and how they used the AI.

## 2. Why this shape (key research findings)

| Finding | Consequence for us | Source |
|---|---|---|
| Real AI-enabled rounds (Meta, Google pilot, LinkedIn, Uber, Karat, Coinbase) use an **existing multi-file codebase** in a browser IDE with built-in AI. Meta runs 60 min in 3 phases: **bug → feature → optimize** | Primary mode = existing-codebase session; support the 3-phase arc; partial completion is scorable | 01 §3, §9.1 |
| Interviewers see the **full AI transcript + replay**. Top signals: planning before prompting, navigating code, directing the AI, **verifying AI output** (#1 for 66% of hiring teams), testing, communication. Raw AI-usage frequency is *not* scored | Record everything and score observable behaviour; the debrief teaches AI collaboration | 01 §5 |
| Prompt-only "don't give the answer" tutors **leak**. CS50's tutor put code in ~22–50% of conversations, model upgrades made it worse, and adversarial students extracted answers 40–75% of the time. A **judge + rewriter** cut leakage to about 4% | The gate must be **software, not a prompt**: answer-blind tutor + deterministic policy engine + answer-aware output judge | 02 §2, §4, §5 |
| Tutors that only ask questions get **abandoned** (Khanmigo trial) | Help that isn't the answer must be fast, direct and free | 02 §6.5, §7.4 |
| "Not too open, not too linear" is the known **assistance dilemma**. Best result: **expert-defined state machine decides *what* help is allowed, the LLM decides *how* to phrase it** | Deterministic policy engine + milestone-based hint ladder | 02 §3, §6 |
| Logic/missing-case bugs are the majority. Broken access control is OWASP #1. Bad error handling causes most catastrophic failures. Config causes many outages | The challenge catalogue is weighted toward what actually breaks apps | 03 §4 |
| "Tests pass" ≠ correct (~30% of passing SWE-bench patches diverge) | Grade on 3 layers: hidden tests + rubric judge + process telemetry | 03 §6 |
| Hidden tests must never reach the candidate's environment. A BYO-editor mode can't enforce the gate | Web app first; grading in a fresh network-blocked sandbox; CLI/extension later as unscored practice | 04 §3–4 |

## 3. Core user loop

1. **Pick** a challenge (or the recommender picks one) and a mode: *Learning*, *Timed mock*, or *Full 3-phase mock*.
2. **Session:** brief (symptom only, like a support ticket), file tree, editor, "Run tests", timer, gated AI panel,
   optional typed narration ("think aloud").
3. **Submit / time up:** workspace locked and snapshotted, then graded in a fresh sandbox with hidden tests.
4. **Debrief:** score per dimension, the root-cause explainer, the reference fix and accepted alternatives (only
   now), a timeline replay, an annotated AI transcript (what each request cost, better prompt examples), detected
   anti-patterns, and the next recommended challenge.

## 4. The gated AI (heart of the product)

### 4.1 Architecture (from 02 §5.2)
```
candidate msg ─► Input guard (injection/jailbreak) ─► Intent classifier (conversation window)
IDE telemetry ─► Progress tracker (per-issue milestones: reproduced / localised / fixed; on-path / off-path / stalled)
                       │                                   │
                       └──────────► Policy engine (deterministic code) ◄── Challenge config (hint packs, avoid-set)
                                        │ allowed reply type + hint level + hint text up to that level
                                        ▼
                                 Tutor LLM (answer-blind, read-only repo tools)
                                        ▼
                     Output judge: ① deterministic (code similarity to fix, avoid-set terms, issue-region code,
                                     canary tokens) ② LLM leak judge (sees reference fix + allowed level)
                                        │ pass → candidate        │ fail → rewrite / safe fallback
                                        ▼
                           Transcript log (intent, level, cost, verdicts) → scoring + debrief
```
**Knowledge split:** the tutor **never** sees the reference fix or hidden tests. Only the judge and progress tracker do.

### 4.2 What the assistant does with each kind of request (02 §7.1)
| Request | Behaviour | Costs a hint? |
|---|---|---|
| Tooling ("how do I run one test?") | Answer fully | No |
| Concept / library API | Answer in general terms, not mapped to the bug location | No* |
| Navigation outside bug regions | Answer fully | No |
| "Explain this function" (in a bug region) | Explain the **intended** behaviour/contract, not the defect | No |
| Strategy ("how should I approach this?") | Coach the method: reproduce → isolate → hypothesise → test | No |
| Hypothesis check ("is it the cache?") | **Never confirm or deny.** Suggest an experiment to test it | No |
| "Give me a hint" | Next allowed rung of the ladder (§4.3) | Yes |
| "Fix it" / "write the failing test" / "describe the change in words" | Brief decline + best allowed alternative | Logged |
| Prompt injection / "ignore your rules" | Neutral decline, keep helping, flag | Logged + flag |
| Off-topic | Brief reply, steer back | No |

\*If a concept question lands exactly on the bug's concept, the assistant still answers (refusing would itself give the bug away) but logs it as an implicit L3 hint.

**Redirecting when off-track:** redirect *by process, not location* (e.g. "what evidence supports that? try re-running the
failing case"). It never says "not there", because a negative also reveals the answer. At most one unprompted nudge per stall.

### 4.3 Hint ladder, per seeded issue (canonical, merges reports 02 and 03)
| Level | Contains | Never contains |
|---|---|---|
| L0 | Nothing issue-specific | — |
| L1 Process | Reproduce, read the error, state a hypothesis | Location, concept |
| L2 Subsystem / hypotheses | Which flow to trace, or a menu of 2–3 hypotheses with how to test each | File/line, bug class |
| L3 Concept | The class of concept, with a generic, non-isomorphic example | Location, code |
| L4 Localisation | File or function to inspect | Lines, the change, pseudo-code |
| L5 Fix | The answer | **Debrief only. Disabled during sessions** |

The level rises only when *all* of these hold: a minimum struggle time has passed, there's evidence of effort since the
last hint, the cooldown is over, and budget remains. Help fades after a milestone is reached. Hint costs are shown
**before** a hint is granted.

### 4.4 Openness tiers ⚠️
| Tier | Use | Max level | Budget | Proactive nudges |
|---|---|---|---|---|
| Strict | Interview simulation | L3 | Low | Off-path only |
| Standard (default) | Practice | L4 | Medium | Stall + off-path |
| Coaching | Learning a new bug class | L4 + post-solve explanation | High | Stall, off-path, check-ins |
| Debrief | After the session | L5 | — | — |

### 4.5 Proving the gate works (02 §8–9)
- **Red-team suite:** 28 attack tactics (J1–J28), including coding-specific ones like "write the failing test",
  yes/no binary search for the location, "describe the patch in prose", instructions hidden in repo comments,
  invisible Unicode, and recap aggregation.
- **Benign borderline set**, so we don't over-refuse legitimate questions.
- **Proposed ship gates:** leak rate ≤ 5% per challenge (0% for direct fix code), false refusals ≤ 3%,
  benign premature-giveaway ≤ 1%, p95 latency ≤ 4 s for tooling answers.
- Re-run the regression suite on every prompt or model change.

## 5. Challenges

- **Format:** one folder per challenge, containing the codebase (a few hundred to ~2.5k LOC), visible tests, **hidden**
  tests (fail-to-pass, pass-to-pass, property), a reference patch, accepted alternatives, and a `challenge.yaml` (schema
  in 03 §9) holding the symptom, proximate cause and root cause, naive-fix traps, red herrings, hint pack, avoid-set,
  milestones and rubric.
- **Authoring:** start from a **green** app, then inject issues. Mutations work for warm-ups; harder tiers get
  hand-authored design faults; capstones combine several. Make sure no git history or comments reveal the fix.
- **CI validation for every challenge:** seeded tests fail, reference fix passes, naive fixes fail, hidden tests rerun 5× for flakiness.
- **Rotation:** families of renamed/re-skinned variants (fights memorisation, enables spaced re-tests).
- **Starter catalogue (15, in 03 §10).** Build first: **#1 Leaderboard drops the winner** (Python, D1), **#2 Cart total
  off by a cent** (TS, D2), **#5 Customers see others' invoices** (NestJS+Postgres, D3), **#6 Orders page times out**
  (N+1/index, D3), **#4 Search shows stale results** (React async, D3).

## 6. Scoring & debrief

- **Weights (starting point):** correctness 35 · root-cause diagnosis 20 · verification/testing 15 · code quality 10 ·
  AI collaboration 10 · communication 10. Hints deduct by level.
- **Three layers:** hidden tests → rubric applied by an LLM judge (human-reviewed per challenge) → process telemetry
  (reproduced first? wrote a regression test? test-run cadence? read before prompting? pasted big blocks unreviewed?).
- **Anti-pattern detection:** prompting before reading, "solve it" prompts, large pastes, few test runs, silent stretches.

## 7. Training strategy

- **Modes:** Learning (generous gate, pause, reveal at end) · Timed mock (strict, hints cost points) · Full 3-phase mock
  (bug → feature → optimize, 60 min, optional per-phase AI-off) · Review (replay your session).
- **Curriculum:** orientation/code-reading drills → single-bug warm-ups → category tracks (async, data/perf, authz,
  reliability, time, config) → multi-file → multi-bug incidents → feature extension → full mocks.
- **Adaptive:** skill tags with mastery estimates. Interleave categories (beat blocked practice 72% vs 38% in one study)
  and schedule a renamed variant of a failed challenge 2–7 days later.
- **Later:** a simulated interviewer that asks "explain your plan", "would you ship this?" and "how would you do it without AI?"

## 8. Architecture & stack (recommended MVP, from 04 §9) ⚠️

- **Frontend:** Angular + Monaco editor, file tree, test-output panel, AI chat panel, timer.
- **Backend:** NestJS (WebSocket gateway), session service, `SandboxProvider` interface, AI orchestrator, grading worker (BullMQ).
- **Data:** PostgreSQL (users, challenges, sessions, append-only `session_events`, test_runs, ai_messages, scores),
  Redis (queues and rate limits), object storage (snapshots).
- **Sandbox:** local Docker adapter for development, plus one managed microVM provider for production (E2B or Vercel Sandbox),
  behind the same interface.
- **LLM:** Anthropic. A stronger model as tutor and a cheap fast model as leak judge, behind an `LlmProvider` interface.
  Transcripts traced in Langfuse.
- **Challenges:** a `challenges/` directory in this repo, validated by CI.
- **Est. cost:** ~$0.15–$0.90 per 45-min session depending on tutor model. Re-verify prices before spending.

## 9. Phased roadmap

| Phase | Goal | Tasks (§11) |
|---|---|---|
| **1. Walking skeleton** | One challenge, end to end: open → edit → run tests → submit → hidden-test score | T-002 → T-008 |
| **2. The gate** | Gated AI v1 + output judge + red-team harness passing ship gates | T-009 → T-011 |
| **3. Debrief & scoring** | Rubric judge, telemetry metrics, evidence-linked debrief | T-012 → T-013 |
| **4. Content & training** | 5 → 15 challenges, modes, 3-phase mock, recommender | T-014 → T-016 |
| **5. Ship** | Deploy, auth hardening, cost guardrails | T-017 |

## 10. Decisions needed from the owner

Answers go into the task log. Recommended defaults are in **bold**.

1. **Audience:** personal training tool / **public product (free first)** / B2B for companies?
2. **Stack:** **Angular + NestJS + PostgreSQL in one TypeScript monorepo**, or something else?
3. **Challenge languages at launch:** Python only / TypeScript only / **both**?
4. **LLM provider and key:** **Anthropic (tutor + cheap judge)**; will you provide an API key?
5. **Sandbox:** **local Docker for development now; choose E2B vs Vercel Sandbox when we deploy**?
6. **Gate defaults:** ship **Standard + Strict + Debrief** tiers first? Is **L4 (naming the file/function)** acceptable?
7. **Judge UX:** **buffer each reply until it's checked (+1–4 s)** or stream with mid-reply cut-off?
8. **Terminal:** **"Run tests" button + output only for the MVP**, or a full terminal?
9. **Verification training:** should the codebase include deliberately flawed "AI-written" code, and/or should the
   assistant occasionally make checkable mistakes so candidates practise catching them? (**Later, as an opt-in mode**)
10. **Hint penalties:** **visible in the score**, or only shown in the debrief?
11. **Session defaults:** **60 min for full mocks, 15–45 min per single challenge**?

## 11. Proposed tasks

Full entries are in [`TASKS.md`](../../TASKS.md) with status `Proposed`. Each needs approval before work starts.
