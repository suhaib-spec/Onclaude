# 03 — Challenge Design: What to Build, How to Author It, How to Grade It

*Research date: 2026-11-11. Scope: which bug/feature scenarios the AI-Assisted Coding Interview Trainer should offer, how to author challenge repos, how to grade sessions, and how to structure candidate training.*

**Conventions**

- Statements followed by a link are sourced facts, paraphrased.
- Paragraphs or bullets tagged **[Design]** are our own recommendations, not claims from a source.
- Figures are given as the source reports them; where a source was silent, we say so instead of filling the gap.

---

## 1. Executive summary

1. **Real interviews have moved to existing, multi-file codebases.** Meta's AI-enabled round gives a multi-file project in CoderPad and stages it as bug fix, then core implementation, then optimization ([Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding)). Google's pilot has candidates read, debug and optimize existing code with Gemini available ([Northeastern career guide](https://careers.northeastern.edu/blog/2026/05/13/googles-ai-assisted-coding-interview-2026-guide/)). Stripe's bug squash grades the debugging process on an unfamiliar repo ([techinterview.org](https://www.techinterview.org/post/3233476020/stripe-bug-bash-api-design-interview/); [PracHub](https://prachub.com/resources/stripe-bug-squash-interview-guide-how-to-debug-an-unfamiliar-codebase)). Our "fix a realistic app" format fits this shift well.
2. **Interviewers grade process, verification and ownership, not just the final diff.** Meta's four areas are problem solving, code quality, verification and communication ([Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding)). Canva warns against handing the work to the AI or chasing feature count ([Canva](https://www.canva.dev/blog/engineering/ai-interview-success/)). Our rubric should score these dimensions explicitly.
3. **Tests alone are not a reliable grader.** Across SWE-bench, about 29.6% of test-passing patches behave differently from the reference fix ([Wang et al.](https://arxiv.org/abs/2503.15223)). In SWE-bench Verified's annotation, 61.1% of sampled tasks had tests that might wrongly reject valid fixes ([OpenAI](https://openai.com/index/introducing-swe-bench-verified/)). Grading should combine hidden fail-to-pass and pass-to-pass tests, a per-challenge rubric, and diagnosis checks.
4. **Most real bugs are semantic or logic errors, not exotic ones.** Semantic bugs make up 70–87% of sampled bugs in Mozilla, Apache and Linux ([Tan et al.](https://www.cs.purdue.edu/homes/lintan/publications/bugchar-emse14.pdf)). Broken access control tops the OWASP Top 10:2025 ([OWASP](https://top10.owasp.org/2025/0x00_2025-Introduction/)). Catastrophic distributed-system failures mostly come from bad error handling ([Yuan et al., via The Morning Paper](https://blog.acolyer.org/2016/10/06/simple-testing-can-prevent-most-critical-failures/)). The catalogue should weight these categories accordingly.
5. **Hints should be hypotheses, not locations, and the ladder must resist click-through.** Debuggers given candidate hypotheses were about 6x more likely to succeed, while being given suspicious code locations did not help significantly ([Alaboudi & LaToza](https://par.nsf.gov/servlets/purl/10206972)). Students in one tutor abused hints on 36% of actions ([LearnLab](https://learnlab.org/research/wiki/index.php/Help_abuse)).
6. **Training should be interleaved and spaced.** Practice testing and distributed practice rated highest utility in a large review ([APS](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)). Interleaved practice beat blocked practice 72% vs 38% on a delayed test ([Rohrer et al.](https://link.springer.com/article/10.3758/s13423-014-0588-3)).

---

## 2. What AI-assisted and debugging interviews actually ask

| Company / format | Codebase | Task types | What is graded | Source |
|---|---|---|---|---|
| **Meta AI-enabled coding** (pilot, ~60 min) | Multi-file project with existing classes and models, three-panel CoderPad; AI can read files but only replies in chat | Phase 1 bug fix (often non-algorithmic, e.g. casting, off-by-one, conditionals), phase 2 core implementation (often 120+ lines), phase 3 optimization against larger tiered inputs | Problem solving, code quality, verification, communication. Over-reliance on AI can hurt, and you must explain any code you use. Finishing all phases is not required. | [Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding) |
| **Google AI-assisted** (pilot, junior/mid) | Existing codebase | Reading, debugging, optimizing with Gemini | AI fluency, output validation, debugging, communication. Heavy reliance without visible understanding drew negative feedback. | [Northeastern](https://careers.northeastern.edu/blog/2026/05/13/googles-ai-assisted-coding-interview-2026-guide/) |
| **Canva** (AI required) | Ambiguous, realistic problems that one prompt can't solve | Clarify requirements, build iteratively | When and how to use AI, decomposition, catching bad AI code, production quality, full ownership | [Canva (policy)](https://www.canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews); [Canva (interviewer guide)](https://www.canva.dev/blog/engineering/ai-interview-success/) |
| **Shopify AI-enabled** | Empty repo, candidate's own IDE and tools | One open-ended problem that grows through follow-ups toward design and extensibility | Planning before prompting, design, directing the AI, cleaning up generated code, testing strategy, communication, product thinking | [Hello Interview](https://www.hellointerview.com/blog/shopify-ai-enabled-coding) |
| **Stripe bug bash / bug squash** | Unfamiliar repo with a failing test, issue or broken behavior | Find and fix the bug | Orientation, hypothesis-driven reasoning, focused tool use, minimal root-cause fix, regression validation, narration. Seniors also discuss blast radius and related code paths. | [techinterview.org](https://www.techinterview.org/post/3233476020/stripe-bug-bash-api-design-interview/); [PracHub](https://prachub.com/resources/stripe-bug-squash-interview-guide-how-to-debug-an-unfamiliar-codebase) |
| **Slack (redesigned take-home)** | A PR in a generated GitHub repo | Code review, at most about two hours | Rubric covering correctness, style, testing, security, performance, maintainability, documentation, communication. Time-to-hire fell from about 200 to under 83 days. | [Slack Engineering](https://slack.engineering/refactoring-backend-engineering-hiring-at-slack/) |

**Cross-cutting signals.** Strong candidates state expected outputs before running code, trace callers before accepting multi-file edits, and can defend or reject any line the model wrote. Accepting a big block after one passing case is a failure mode, and so is refusing AI altogether ([techinterview.org](https://www.techinterview.org/post/3233476832/what-interviewers-grade-when-you-can-use-copilot/)). Stripe-style guidance stresses reproducing first, changing one thing at a time, and not guessing fixes after skimming a few lines ([techinterview.org](https://www.techinterview.org/post/3233476020/stripe-bug-bash-api-design-interview/)).

**[Design]** These rounds imply seven task types for our catalogue:
1. Single-bug hunt (Stripe-style)
2. Multi-bug or compound incident
3. Feature extension on existing code (Meta phase 2 style)
4. Performance fix against tiered inputs (Meta phase 3 style)
5. Code review of a seeded PR (Slack-style)
6. Write or repair tests, including flaky ones
7. Read-and-explain: comprehension questions about unfamiliar code before any edit

---

## 3. Lessons from benchmarks for authoring and grading

| Benchmark | Relevant facts | Takeaway for us |
|---|---|---|
| **SWE-bench / Verified** | Each task pairs a real issue with fail-to-pass tests (fixed by the change) and pass-to-pass tests (behavior that must not regress). Tests are hidden from the solver. Annotators flagged 38.3% of samples as underspecified and 61.1% as having unfair tests, and 68.3% were filtered out. Verified (500 tasks) has an "easy" bucket of 196 tasks under 15 minutes and 45 tasks over an hour. ([OpenAI](https://openai.com/index/introducing-swe-bench-verified/)) | Use hidden F2P + P2P tests. Have several people annotate each challenge for specification clarity and test fairness. Estimate time with pilot solvers. |
| **SWE-bench Lite** | 300 tasks. Excluded issues that edit more than one file, have more than three hunks, add or remove files, check error messages in tests, or have very short statements. ([swebench.com](https://www.swebench.com/lite)) | These filters are a good recipe for our warm-up tier. Lifting them gives a recipe for harder tiers. |
| **SWE-Bench Pro** | 1,865 tasks. Reference fixes average about 107 lines over 4.1 files, and trivial edits were excluded. Humans added requirements and interface notes. Scores were 25.9% with this augmentation vs 8.4% without for one model. Gold tests were rerun to rule out flakiness. ([Deng et al.](https://arxiv.org/html/2509.16941v2)) | Feature-extension challenges need a written requirements list and an interface contract, or grading becomes a guessing game. Rerun hidden tests to check for flakiness. |
| **SWE-bench Multimodal** | 617 JS tasks from 17 visual or front-end libraries, each with an image. The best system resolved 12%. ([Yang et al.](https://arxiv.org/abs/2410.03859)) | Front-end and visual bugs are harder and underrepresented. Include screenshot-based symptoms. |
| **SWE-Lancer** | More than 1,400 Upwork tasks. Implementation tasks are graded with end-to-end tests triple-verified by engineers. "Manager" tasks have the model choose between proposals. ([OpenAI](https://openai.com/index/swe-lancer/)) | Use end-to-end tests for user-visible behavior. A "choose the right fix" multiple-choice item is a cheap way to test judgment. |
| **DebugBench** | 4,253 instances in C++, Java and Python. Bugs were implanted by GPT-4 into LeetCode code, then quality-checked. Difficulty varies by bug category. ([Tian et al.](https://arxiv.org/abs/2401.04621)) | LLM-implanted bugs scale but need human QA. Track difficulty per category. |
| **SWE-smith** | 50k instances from 128 repos. Bugs come from LLM "modify" and "rewrite", AST-level procedural edits (e.g. inverted conditions), reverting real PRs, and combining several patches. Repos must pass 80% of their tests first. ([arXiv](https://arxiv.org/abs/2504.21798v1); [Emergent Mind summary](https://www.emergentmind.com/topics/swe-smith-pipeline)) | Our bug-injection toolbox: mutation operators, LLM-modify, PR-revert, and combine-for-multi-bug. Require a green baseline before seeding. |
| **Mutants vs real faults (Just et al.)** | About 73% of 357 real Defects4J faults were coupled to common mutants, mostly conditional or relational operator changes and statement deletion. About 17% were not coupled, mainly algorithm changes and deleted code. ([Just et al.](https://cs.ubc.ca/~rtholmes/papers/fse_2014_just.pdf)) | Simple mutations make realistic warm-ups. Harder tiers need hand-authored "missing logic" and design-level faults that mutation can't produce. |
| **"Solved" issues study** | 7.8% of patches counted as passing fail the full developer test suite. 29.6% of plausible patches diverge behaviorally from ground truth, and resolution rates are inflated by about 6.2 points. ([Wang et al.](https://arxiv.org/abs/2503.15223)) | Run the full P2P suite, add differential or property tests against the reference, and do not treat "tests green" as solved. |
| **BloomAPR** | Renaming identifiers cut plausible-patch rates sharply, which signals memorization. Reinjecting the same root cause into real projects was the hardest layer. Many plausible patches were invalid. ([BloomAPR](https://arxiv.org/pdf/2509.25465)) | Rename and re-skin challenge variants so the assistant (or a leaked writeup) can't recall the answer. Layer difficulty by context, not just bug type. |
| **LLM-as-judge for patches** | A per-bug rubric drafted by an LLM and refined once by humans reached kappa 0.75 against unanimous human labels. Unrefined rubrics scored kappa 0.38. Independent human raters agreed only at kappa 0.31. ([Google, arXiv 2511.10865](https://arxiv.org/html/2511.10865v1)) | Rubric-guided LLM grading is viable only with human-reviewed, per-challenge rubrics. Keep a human-review path for disputed scores. |

---

## 4. Taxonomy of common app bugs (empirically grounded)

### 4.1 What the evidence says about frequency

- **Semantic or logic bugs dominate.** They were 87.0% of sampled Mozilla bugs, 82.5% of Apache and 70.1% of Linux. The largest subtype is wrong functionality implementation. Missing cases are large in Apache (18.8%) and Linux (23.3%). Concurrency was rare outside the kernel (1.2–5.2%) ([Tan et al.](https://www.cs.purdue.edu/homes/lintan/publications/bugchar-emse14.pdf)).
- **Novices' bugs** are mostly missing or malformed code. Off-by-one errors, operator precedence and code on the wrong side of a loop recur across languages ([McCauley et al. extract](https://www.tech.dmu.ac.uk/~djohns02/notes/modules/education/EDUC2323/2021/content/Week%203%20Guess%20the%20Number/Handout_ExtractsFromMcCauleyEtAl2008.pdf)).
- **Concurrency bugs.** In 105 real bugs, about a third of non-deadlock bugs were order violations. 92% could be triggered by ordering at most 4 memory accesses. About 73% were not fixed by just adding locks ([Lu et al., Microsoft Research](https://www.microsoft.com/en-us/research/?p=1123215)). In Node.js, the most common type was the atomicity violation, from wrongly assuming a callback chain runs atomically ([Davis et al., via The Morning Paper](https://blog.acolyer.org/2017/06/09/node-fz-fuzzing-the-server-side-event-driven-architecture/)).
- **Error handling.** In 48 catastrophic failures, 92% came from mishandling explicitly signalled non-fatal errors. Detectable patterns include ignored or log-only handlers, TODO handlers and over-broad catches. 77% were reproducible with a unit test ([Yuan et al., via The Morning Paper](https://blog.acolyer.org/2016/10/06/simple-testing-can-prevent-most-critical-failures/)). OWASP 2025 added "Mishandling of Exceptional Conditions" (A10), which covers fail-open behavior ([OWASP](https://top10.owasp.org/2025/0x00_2025-Introduction/)).
- **Security.** Broken Access Control is #1 in OWASP 2025, Security Misconfiguration rose to #2, and Software Supply Chain Failures is new at #3. The ranking draws on data from over 2.8 million apps ([OWASP](https://top10.owasp.org/2025/0x00_2025-Introduction/); [The Register](https://www.theregister.com/2025/11/11/new_owasp_top_ten_broken/)). For APIs, BOLA/IDOR (swapping an object ID for someone else's) is API1:2023 ([APISecurity.io](https://apisecurity.io/owasp-api-security-top-10/api1-2023-broken-object-level-authorization/)).
- **Production outages.** At Google, the top triggers were binary pushes (37%) and configuration pushes (31%) ([Google SRE Workbook](https://sre.google/workbook/postmortem-analysis)).
- **Flaky tests.** In Apache projects, the top root causes were async wait (about 45%), concurrency (about 20%) and test order dependency (about 12%) ([Luo et al.](https://huang.isis.vanderbilt.edu/cs8395/paper/flakytest.pdf)). In JavaScript, concurrency (20.7%), async wait (19.6%), OS (18.4%) and network (12.6%) led ([Hashemi et al.](https://ar5iv.labs.arxiv.org/html/2207.01047)).

**[Design]** Weight the catalogue roughly to match: about 40% logic or missing-case bugs inside realistic features, about 15% access control or security, about 15% async/concurrency, about 10% data or performance, about 10% error handling or reliability, and about 10% config, dependency or test-infrastructure bugs.

### 4.2 Category reference table

Each row gives a typical symptom, root cause and a fix pattern to grade against. The "seed recipe" column (marked **[Design]**) describes how we would inject it.

| # | Category | Typical symptom | Root cause / fix (source) | Seed recipe **[Design]** |
|---|---|---|---|---|
| 1 | **Off-by-one / boundary / missing case** | Last item missing, wrong page count, empty input crashes | Wrong comparison or loop bounds, unhandled case ([McCauley](https://www.tech.dmu.ac.uk/~djohns02/notes/modules/education/EDUC2323/2021/content/Week%203%20Guess%20the%20Number/Handout_ExtractsFromMcCauleyEtAl2008.pdf); [Tan](https://www.cs.purdue.edu/homes/lintan/publications/bugchar-emse14.pdf)) | Relational-operator mutation (`<`→`<=`), delete a guard clause |
| 2 | **Async ordering / stale responses (front end)** | Search shows results for an older query when typing fast | Responses arrive out of order and the stale one sets state last. Fix with effect cleanup and an ignore flag, or cancel the request ([React docs](https://react.dev/learn/you-might-not-need-an-effect.md)) | Remove cleanup; add artificial jitter in the mock API so it reproduces |
| 3 | **Redundant / derived state** | Totals or labels out of sync with inputs | Storing a computable value in state and syncing it via an effect. Compute it during render instead ([React docs](https://react.dev/learn/you-might-not-need-an-effect.md)) | Duplicate a value into state with a missing dependency |
| 4 | **Check-then-act race (backend)** | Negative stock, double booking under load | Gap between read and write. Fix with an atomic conditional update, `SELECT … FOR UPDATE`, or optimistic version checks ([DEV: race conditions in APIs](https://dev.to/fazal_mansuri_/race-conditions-in-apis-the-bug-you-cant-see-5c0h)) | Split an atomic `UPDATE … WHERE stock>0` into read + write; ship a concurrent load test as the hidden test |
| 5 | **Atomicity across callbacks/awaits (Node)** | Inconsistent DB state, sporadic crashes | Assuming a callback/await chain is atomic ([Davis et al.](https://blog.acolyer.org/2017/06/09/node-fz-fuzzing-the-server-side-event-driven-architecture/)) | Insert an `await` between a read and its dependent write |
| 6 | **N+1 queries** | List page slows linearly with rows | One query per parent row from lazy loading. Fix with eager loading or a batched `IN (…)` query ([AppSignal](https://blog.appsignal.com/2020/06/09/n-plus-one-queries-explained)) | Replace a join/include with per-row lazy access in a serializer |
| 7 | **Missing index (esp. on FKs)** | Slow deletes or filters, sequential scans | Postgres doesn't automatically index the referencing side of a foreign key. One example cascade delete scanned 5M rows ([CYBERTEC](https://www.cybertec-postgresql.com/en/?p=4662)) | Drop the FK index in the migration; seed 1M rows; grade on `EXPLAIN` / time threshold |
| 8 | **Pagination** | Duplicate or skipped items in infinite scroll; deep pages slow | OFFSET scans and discards preceding rows, and keyset pagination is much faster (158 ms vs about 2 ms in one example). Keyset needs a unique, indexed key ([CockroachDB docs](https://docs.cockroachlabs.com/docs/stable/pagination.md)) | Non-unique sort key plus inserts during paging; OFFSET on large table |
| 9 | **Cache invalidation** | Edits don't appear; revoked access persists | Stale cache-aside entries. Racing writers can pin an old value, so delete the key rather than set it. Also stampedes on expiry and cached permissions ([techinterview.org](https://www.techinterview.org/post/3233476413/where-caching-helps-and-where-it-bites/)) | Update path forgets to invalidate, or uses a different key format than the read path |
| 10 | **Date / time zone** | Date shows a day early for US users; DST off-by-hour | JS `Date` reads date-only strings as UTC but date-time strings as local time ([DEV: JS Date oddity](https://dev.to/apisurfer/js-date-constructor-timezone-oddity-2boj)). Offsets aren't whole hours, DST varies by place, and some local times occur twice ([Zain Rizvi](https://zainrizvi.io/blog/falsehoods-programmers-believe-about-time-zones/)) | Parse `YYYY-MM-DD` with `new Date()`; compute "days until" by dividing ms by 86,400,000 |
| 11 | **Money / floating point** | Totals off by a cent | Binary floats can't represent many decimals (e.g. 1.40×165 isn't 231 exactly), and rounding points matter. Use integer minor units or a decimal/money type ([Evan Jones](https://evan-jones.appspot.com/floating-point-money.html)) | Store prices as floats; round per line vs per total inconsistently |
| 12 | **Broken access control / IDOR (BOLA)** | User A can read user B's invoice by changing the ID | Object-level authorization not checked on every request; client-supplied IDs trusted ([APISecurity.io](https://apisecurity.io/owasp-api-security-top-10/api1-2023-broken-object-level-authorization/); [OWASP](https://top10.owasp.org/2025/0x00_2025-Introduction/)) | Authorization check present on list endpoint but omitted on detail/update endpoint |
| 13 | **Swallowed errors / fail-open** | Jobs "succeed" but nothing happens; auth passes on error | Empty or log-only catch blocks, over-broad catches ([Yuan et al.](https://blog.acolyer.org/2016/10/06/simple-testing-can-prevent-most-critical-failures/); [OWASP A10](https://top10.owasp.org/2025/0x00_2025-Introduction/)) | `catch (e) { logger.debug(e) }` around the send call; auth middleware that calls `next()` in catch |
| 14 | **Retries without idempotency** | Double charge or duplicate order after a timeout | Retrying a non-idempotent POST. Stripe-style idempotency keys store the first result and reject reuse with different params ([Stripe docs](https://docs.stripe.com/api/idempotent_requests.md)) | Client retries on timeout; server lacks idempotency-key table |
| 15 | **Memory / subscription leaks** | UI slows the longer it stays open | Subscriptions to never-completing observables outlive the component. Fix with `takeUntilDestroyed` or by unsubscribing ([Zühlke](https://software-engineering-corner.zuehlke.com/rxjs-memory-leaks-in-angular)) | Subscribe to `interval`/`valueChanges` without teardown in a routed component |
| 16 | **Config / environment** | Works locally, fails in staging; secrets in repo | Config should live in env vars, not code or named env groups ([12factor.net](https://12factor.net/config)). Config pushes trigger 31% of outages at Google ([SRE Workbook](https://sre.google/workbook/postmortem-analysis)) | Misnamed env var silently falling back to a default; hard-coded prod URL |
| 17 | **Dependency / supply chain** | Breaks after fresh install | OWASP 2025 A03 covers dependency, build and distribution failures ([OWASP](https://top10.owasp.org/2025/0x00_2025-Introduction/)) | Unpinned range picks up a breaking minor version; lockfile out of sync **[Design]** |
| 18 | **Flaky tests** | CI fails intermittently | Async wait, concurrency, order dependency ([Luo et al.](https://huang.isis.vanderbilt.edu/cs8395/paper/flakytest.pdf); [Hashemi et al.](https://ar5iv.labs.arxiv.org/html/2207.01047)) | Fixed `sleep` instead of awaiting; shared mutable fixture across tests |
| 19 | **Mobile lifecycle state loss** | Form input lost on rotation or after backgrounding | Config changes recreate the Activity, and process death destroys ViewModels. Small UI state belongs in `SavedStateHandle`/`rememberSaveable` ([Android docs](https://developer.android.com/topic/libraries/architecture/saving-states)) | Keep form state in a plain `remember`/Activity field |

---

## 5. Authoring challenge repos

### 5.1 Size and realism

- SWE-bench Lite's filters (single file, three or fewer hunks, no file adds) describe a "small fix" tier. SWE-Bench Pro's averages (about 107 lines, 4.1 files) describe a "real feature" tier ([swebench.com](https://www.swebench.com/lite); [Deng et al.](https://arxiv.org/html/2509.16941v2)).
- Meta's round leaves roughly 30–40 minutes of work after orientation, and the bug-fix phase is usually small and non-algorithmic ([Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding)).
- **[Design]** Target repo sizes:

  | Tier | Lines of code | Files | Time limit |
  |---|---|---|---|
  | Warm-up | 300–800 | 5–10 | 15–20 min |
  | Standard | 1,500–4,000 | 15–40, with real layering (routes → services → repos; components → hooks → API client) | 30–45 min |
  | Capstone | 5,000–10,000 | — | 60–90 min |

  Every repo ships a README, a one-command run/test script, seed data, and a ticket-style brief that describes the *symptom* (what a user or PagerDuty saw), never the cause.

### 5.2 Seeding bugs

From the SWE-smith and mutation-testing literature ([SWE-smith summary](https://www.emergentmind.com/topics/swe-smith-pipeline); [Just et al.](https://cs.ubc.ca/~rtholmes/papers/fse_2014_just.pdf)):

1. **Start from a green baseline.** Write the correct app with a thorough test suite. SWE-smith requires environments to pass at least 80% of tests before seeding.
2. **Pick an injection method by tier:**
   - *Procedural mutations* (operator or condition flips, statement deletion) cover the roughly 73% of real faults that couple to simple mutants. Use them for warm-ups.
   - *LLM-modify / LLM-rewrite* produce plausible subtle bugs, but need human QA. DebugBench also quality-checked its GPT-4-implanted bugs ([Tian et al.](https://arxiv.org/abs/2401.04621)).
   - *PR-revert* means reverting a real fix, which yields realistic regressions.
   - *Hand-authored design faults* such as missing authorization, missing idempotency or wrong data model. Just et al. found algorithm changes and deleted code are the faults mutants miss.
   - *Combine* several seeded patches for multi-bug or capstone tasks.
3. **Validate each seed.** It must break at least one hidden fail-to-pass test while every pass-to-pass test still passes. **[Design]** Rerun hidden tests at least 5 times to catch flakiness, as SWE-Bench Pro reran gold tests ([Deng et al.](https://arxiv.org/html/2509.16941v2)).
4. **Anti-memorization variants.** Renaming identifiers sharply reduced LLM repair rates in BloomAPR, which shows memorization is real ([BloomAPR](https://arxiv.org/pdf/2509.25465)). **[Design]** Generate variants with renamed domain entities (e.g. "orders" becomes "bookings"), shuffled file layout, and a different but equivalent seed location. Rotate variants so neither the gated AI nor shared writeups give away the answer.

### 5.3 Layered difficulty: symptom vs root cause

**[Design]** Each challenge should define three layers so grading can tell a patch from a diagnosis:
- **Symptom.** What the brief and the visible failing test show, e.g. "order list endpoint returns 504 for big accounts".
- **Proximate cause.** Where a naive fix lands, e.g. raising the timeout or adding a cache.
- **Root cause.** What a real fix addresses, e.g. an N+1 query plus a missing FK index.

Hidden tests should *fail* naive proximate fixes, for example a performance threshold that a timeout bump cannot meet, or a concurrency test that a retry cannot pass. Stripe-style grading explicitly rewards the smallest change that fixes the root cause ([PracHub](https://prachub.com/resources/stripe-bug-squash-interview-guide-how-to-debug-an-unfamiliar-codebase)).

### 5.4 Red herrings

**[Design]** Real codebases contain code that looks wrong but isn't. Each standard or capstone challenge should include one or two:
- an ugly but correct function
- a TODO comment near, but unrelated to, the bug
- a suspicious-looking but valid JWT check
- a noisy, irrelevant log warning

These test whether the candidate *verifies before editing*, the behavior Stripe and Meta reward ([techinterview.org](https://www.techinterview.org/post/3233476020/stripe-bug-bash-api-design-interview/); [Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding)). Hidden pass-to-pass tests should cover red-herring code, so "fixing" it in a way that changes behavior is penalized. Keep red herrings fair: they must be explainable as legitimate code, not traps.

### 5.5 Specification quality checklist

Adapted from SWE-bench Verified and Pro ([OpenAI](https://openai.com/index/introducing-swe-bench-verified/); [Deng et al.](https://arxiv.org/html/2509.16941v2)):
- Is the brief specific enough that a competent engineer knows what "fixed" means?
- Do hidden tests accept every reasonable correct fix? Avoid checking exact error-message strings, which Lite excluded ([swebench.com](https://www.swebench.com/lite)).
- For features: is there a requirements list and an interface contract (function names and endpoints the tests call)?
- **[Design]** Was the challenge solved by at least 2 pilot engineers (with and without AI), with median time recorded to calibrate the time limit?

### 5.6 Leak protection for the gated AI

**[Design]** Each challenge carries `ai_gate` metadata:
- `banned_leak_patterns`: regexes for the fix itself (e.g. `FOR UPDATE`, `ignore\s*=\s*true`, the exact file:line of the seed).
- `forbidden_disclosures`: "the bug is in X", "change Y to Z".
- `allowed_help`: concept explanations, how to use the debugger/profiler/`EXPLAIN`, how to write a repro test, questions back to the candidate.

The gate scans every assistant reply against these patterns before delivery. This matches the observation that Meta's assistant can see files but only chats ([Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding)), and the learning evidence in §7.

---

## 6. Grading and scoring

### 6.1 Automated correctness layer

- **Hidden fail-to-pass tests** (bug fixed or feature works) plus **pass-to-pass tests** (nothing else broke), as in SWE-bench ([OpenAI](https://openai.com/index/introducing-swe-bench-verified/)).
- **End-to-end tests** for user-visible behavior, as SWE-Lancer does ([OpenAI](https://openai.com/index/swe-lancer/)).
- **[Design]** For performance challenges: query-count assertions (e.g. at most 3 queries per request) and timing thresholds on seeded large data. For race challenges: a concurrent hammer test run N times.
- **[Design]** Differential or property tests against the reference solution, to catch the plausible-but-wrong patches found in about 29.6% of SWE-bench passes ([Wang et al.](https://arxiv.org/abs/2503.15223)).

### 6.2 Rubric dimensions

**[Design]** Suggested default weights, overridable per challenge:

| Dimension | Weight | Evidence used | Grounding |
|---|---|---|---|
| Correctness | 35% | Hidden F2P/P2P/E2E/property tests | SWE-bench, SWE-Lancer |
| Root-cause diagnosis | 20% | Candidate's written "what was wrong and why" checked against rubric points; fix location vs root-cause files; naive-fix tests | Stripe grading of minimal root-cause fixes ([PracHub](https://prachub.com/resources/stripe-bug-squash-interview-guide-how-to-debug-an-unfamiliar-codebase)) |
| Verification & testing | 15% | Did they reproduce first? Did they add a regression test? Did they run tests before claiming done? | Meta "verification" ([Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding)); Stripe validation |
| Code quality & minimality | 10% | Diff size vs reference, style/lint, no unrelated rewrites, red herrings untouched | Meta code quality; Slack rubric ([Slack](https://slack.engineering/refactoring-backend-engineering-hiring-at-slack/)) |
| AI collaboration quality | 10% | Ratio of conceptual/explanatory prompts to "write it for me" prompts; whether AI output was checked before use; correcting AI mistakes | Canva signals ([Canva](https://www.canva.dev/blog/engineering/ai-interview-success/)); Anthropic interaction patterns ([Anthropic](https://www.anthropic.com/research/AI-assistance-coding-skills)) |
| Communication | 10% | Quality of hypotheses log and final explanation | Meta and Stripe narration emphasis |

**Modifiers [Design]:**
- **Hints.** Each hint level costs points, e.g. L1 −2, L2 −5, L3 −10, solution reveal caps the score at 50.
- **Time.** A small bonus for finishing under par. No penalty within the limit, because Meta candidates who didn't finish still got offers ([Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding)).

### 6.3 Rubric-guided LLM judging

For the non-test dimensions, use an LLM judge with a **per-challenge rubric written or reviewed by a human**. Human-refined rubrics brought judge agreement to kappa 0.75 on clear cases, vs 0.38 for an unrefined draft ([arXiv 2511.10865](https://arxiv.org/html/2511.10865v1)). **[Design]** Show the judge's justification to the candidate, keep a "dispute" button, and calibrate against a small human-graded set per challenge.

### 6.4 AI-usage telemetry

The Anthropic RCT found that how people used AI mattered more than whether they used it:
- Conceptual questions, and generating code then asking to understand it, kept quiz scores around 65% or higher.
- Full delegation and iterative "AI, fix it" debugging fell below 40%.
- The largest gap between AI and non-AI groups was on debugging questions.

([Anthropic](https://www.anthropic.com/research/AI-assistance-coding-skills))

**[Design]** Classify each assistant exchange (conceptual / explain-code / tool-how-to / generate / fix-for-me) and report the mix in the debrief. Since the gate blocks fix-for-me requests, also count blocked attempts as a coaching signal rather than a penalty in learning mode.

### 6.5 Post-session debrief

**[Design]** Generate a structured debrief:
1. **Outcome card:** tests passed and failed (named by behavior, not file), score by dimension.
2. **Timeline:** when they reproduced, first correct hypothesis, first edit, tests run. Early correct hypotheses predict success, about 5x in one study ([Alaboudi & LaToza](https://par.nsf.gov/servlets/purl/10206972)), so highlight time to first correct hypothesis.
3. **Root-cause explainer:** revealed after the session. Symptom → proximate → root cause, the reference diff, and acceptable alternative fixes.
4. **What a strong candidate would have done:** a short process replay (orientation → repro → narrowing → minimal fix → regression test).
5. **AI-usage mix**, with one concrete better prompt the candidate could have used.
6. **Skill deltas and next recommended challenge** (see §8).

---

## 7. Hint ladder design

- Clicking through to a bottom-out hint is a recognized form of gaming the system. It occurred on 36% of actions in one tutor unit, or 14% when rapid requests are collapsed ([LearnLab](https://learnlab.org/research/wiki/index.php/Help_abuse)).
- Suggesting *candidate hypotheses with testing steps* made debuggers about 6x more likely to succeed. Pointing at suspicious *locations* did not help significantly ([Alaboudi & LaToza](https://par.nsf.gov/servlets/purl/10206972)).

**[Design]** Ladder per challenge, authored by hand and stored in metadata:

| Level | Type | Example (N+1 challenge) | Cost |
|---|---|---|---|
| L0 | Process nudge (free, can be AI-generated) | "What's your reproduction? What did you expect vs observe?" | 0 |
| L1 | Observation prompt | "Try counting the SQL statements this request makes." | small |
| L2 | Hypothesis menu (2–3 plausible causes incl. the real one, with how to test each) | "Could it be (a) network latency, (b) per-row queries, (c) a missing index? How would you tell?" | medium |
| L3 | Narrowed hypothesis | "The query count grows with the number of orders. What in the serializer runs per order?" | large |
| L4 | Solution walkthrough (ends attempt in timed mode) | Reference explanation | caps score |

Rate-limit levels (e.g. at least 3 minutes or one test run between levels) to stop click-through. Never make a location-only hint the main rung.

---

## 8. Training strategy for candidates

### 8.1 Curriculum

**[Design]**

| Stage | Goal | Content | Exit criterion |
|---|---|---|---|
| 0. Orientation drills (5–10 min) | Read unfamiliar code fast | "Find the entry point, the test command, and where X is computed" plus comprehension questions | 80% accuracy |
| 1. Warm-ups | Single, local logic bugs | Lite-style one-file, ≤3-hunk bugs (off-by-one, wrong condition, float money) | 3 in a row under par, ≤L1 hints |
| 2. Category tracks | One bug class in realistic context | Async/state, data/perf, security/authz, reliability, time, config | ≥70% per track |
| 3. Multi-file single bug | Trace across layers | Symptom in UI, root cause in service or DB | Root cause identified ≥80% |
| 4. Multi-bug / incident | Triage and prioritization | Two or three combined seeds plus red herrings | — |
| 5. Feature extension | Build on existing code with AI | Requirements and interface list, hidden edge-case tests (Meta phase 2 style) | — |
| 6. Optimization & review | Meta phase 3 and Slack-style review | Tiered inputs; PR review with seeded issues | — |
| 7. Full mocks | Interview simulation | 45–60 min, staged phases, strict AI gate, no solution reveal | — |

### 8.2 Practice modes

**[Design]**
- **Learning mode:** generous hint ladder, AI explains concepts, pause allowed, solution reveal at the end.
- **Timed mock:** fixed clock, hints cost points, the AI gate is stricter, debrief only at the end. Mirrors staged rounds where finishing everything is not required ([Hello Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding)).
- **Review mode:** replay your own session timeline against the reference process.

### 8.3 Scheduling

- Practice testing and distributed (spaced) practice were the only techniques rated high utility, while rereading and highlighting rated low ([APS](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)).
- Interleaving dissimilar problem types beat blocked practice 72% vs 38% two weeks later, by improving the ability to tell problem types apart ([Rohrer et al.](https://link.springer.com/article/10.3758/s13423-014-0588-3)).
- Debugging practice can be taught explicitly, and finding bugs depends on understanding the whole program ([McCauley et al. extract](https://www.tech.dmu.ac.uk/~djohns02/notes/modules/education/EDUC2323/2021/content/Week%203%20Guess%20the%20Number/Handout_ExtractsFromMcCauleyEtAl2008.pdf)).

**[Design]** After stage 2, the recommender should interleave categories rather than serve five cache bugs in a row. Schedule a renamed variant of a failed challenge 2–7 days later. Hide the bug category from the candidate in stages 3 and up, since recognizing the category is part of the skill.

### 8.4 Skill tracking

**[Design]** Tag every challenge with skills (e.g. `async-ordering`, `authz`, `sql-perf`, `repro-first`, `regression-test`, `ai-verification`). Keep a per-skill mastery estimate updated from the rubric dimensions; an Elo-style or Bayesian knowledge-tracing update is enough to start. Use it to:
1. pick the next challenge: weakest skill, at a difficulty slightly above current level
2. show a radar chart in the debrief
3. trigger the spaced re-tests

---

## 9. Proposed challenge metadata schema (YAML)

**[Design]**

```yaml
id: authz-idor-invoices-001
version: 3
title: "Customers can see each other's invoices"
variant_of: authz-idor-invoices        # family; variants are renamed/re-skinned
stack:
  language: typescript
  frameworks: [nestjs, typeorm, postgres]
  runtime: node20
  run_cmd: "npm run dev"
  test_cmd: "npm test"
task_type: bug_hunt                    # bug_hunt | multi_bug | feature | perf | refactor | write_tests | code_review | flaky_test | read_explain
difficulty:
  authored: 3                          # 1-5
  calibrated: 3.4                      # from pilot + live solve data
  pilot_median_minutes: 22
time_limit_minutes: 35
skills: [authz, api-security, multi-file-tracing, regression-test]
categories: [broken-access-control]
brief: |                               # candidate-facing ticket: symptom only
  Support ticket #4821: a customer reports they could open an invoice PDF
  that belongs to a different company after editing the URL. Reproduce,
  fix, and explain the cause.
repo:
  path: challenges/authz-idor-invoices/v3
  loc: 2400
  files: 31
seeded_issues:
  - id: S1
    category: broken-access-control
    files: [src/invoices/invoices.controller.ts, src/invoices/invoices.service.ts]
    symptom: "GET /invoices/:id returns invoices of other tenants"
    proximate_cause: "controller passes raw :id to service"
    root_cause: "service.findOne lacks tenant scoping; list endpoint has it, detail/update don't"
    injection_method: hand_authored     # mutation | llm_modify | pr_revert | hand_authored | combined
red_herrings:
  - file: src/auth/jwt.strategy.ts
    note: "unusual clock-skew handling looks wrong but is correct; covered by P2P tests"
tests:
  visible: [test/invoices.list.spec.ts]
  hidden:
    fail_to_pass: [hidden/invoices.idor.e2e.spec.ts, hidden/invoices.update.idor.e2e.spec.ts]
    pass_to_pass: [hidden/regression/**]
    property: [hidden/props/tenant-isolation.prop.spec.ts]
  flake_check_runs: 5
grading:
  weights: {correctness: 35, root_cause: 20, verification: 15, quality: 10, ai_collab: 10, communication: 10}
  root_cause_rubric:
    - "Identifies missing object-level authorization (tenant/owner check) on detail and update paths"
    - "Notes the check must happen server-side on every request, not via unguessable IDs alone"
  naive_fix_traps:
    - "Switching to UUIDs only (still fails hidden test using a leaked UUID)"
    - "Patching the controller for GET but not PATCH"
  hint_costs: {L1: 2, L2: 5, L3: 10, L4: cap_50}
hints:
  L0: "What request reproduces it? What should the server have checked?"
  L1: "Compare how the list endpoint and the detail endpoint decide which rows a user may see."
  L2: "Hypotheses: (a) JWT not verified, (b) per-object ownership not checked, (c) DB row-level security misconfigured. How would you test each?"
  L3: "The JWT is fine. Look at what the detail query filters on."
ai_gate:
  allowed_help: [concepts, tool_usage, test_writing_guidance, socratic_questions]
  forbidden_disclosures: ["bug location", "exact fix", "which hypothesis is right"]
  banned_leak_patterns:
    - "invoices\\.service\\.ts.*findOne"
    - "where:\\s*\\{[^}]*tenantId"
    - "add (a )?tenant (id )?check"
solution:
  reference_patch: solutions/authz-idor-invoices/v3.patch
  accepted_alternatives: ["policy guard/interceptor", "repository-level scoped query"]
  explanation_md: solutions/authz-idor-invoices/v3.md
debrief:
  key_lesson: "Authorize every object access server-side; list-level checks don't cover detail routes."
  further_reading: ["https://apisecurity.io/owasp-api-security-top-10/api1-2023-broken-object-level-authorization/"]
provenance:
  authors: [author-handle]
  reviewed_by: [reviewer-handle]
  spec_clarity_votes: [ok, ok, ok]     # SWE-bench-Verified-style triple annotation
  test_fairness_votes: [ok, ok, minor]
```

---

## 10. Initial challenge catalogue (15)

All entries are **[Design]** proposals. Each one's issue type is grounded in the §4 taxonomy sources. D = difficulty on a 1–5 scale; ⏱ = time limit.

| # | Title | Stack | Scenario (brief shows symptom only) | Seeded issue(s) | Skills | D / ⏱ |
|---|---|---|---|---|---|---|
| 1 | **Leaderboard drops the winner** | Python (FastAPI) | "Top 10" API returns 9 rows and ties are ordered randomly | Off-by-one slice; unstable sort without tie-breaker | Boundaries, repro test | 1 / 15m |
| 2 | **Cart total off by a cent** | TypeScript (Node) | Some orders charge $0.01 more than the receipt | Float prices; per-line vs total rounding mismatch | Money handling, numeric reasoning | 2 / 20m |
| 3 | **Birthday shows a day early** | Angular + TS | US users see dates one day earlier; "days until" wrong around DST | `new Date('YYYY-MM-DD')` read as UTC; ms/86,400,000 day math | Date/time, locale testing | 2 / 25m |
| 4 | **Search shows stale results** | React + TS | Typing fast shows results for an older query | Effect lacks cleanup/ignore; derived `count` kept in state | Async ordering, React effects | 3 / 30m |
| 5 | **Customers can see others' invoices** | NestJS + Postgres | Support ticket about URL editing (see §9) | BOLA on detail and update routes; JWT red herring | Authz, multi-file tracing | 3 / 35m |
| 6 | **Orders page times out for big accounts** | Django or NestJS/TypeORM + Postgres | p95 latency grows with order count | N+1 in serializer + missing FK index; naive cache trap | SQL perf, EXPLAIN, profiling | 3 / 35m |
| 7 | **Edits don't show up** | Node + Redis | Profile changes appear only after ~10 minutes | Cache-aside: update path invalidates wrong key format; set-instead-of-delete race | Caching, consistency | 3 / 30m |
| 8 | **Infinite scroll repeats items** | Express API + React | Feed shows duplicates and skips while new posts arrive | OFFSET pagination on non-unique `created_at`; fix with keyset (`created_at, id`) | Pagination, API design | 3 / 35m |
| 9 | **Dashboard slows the longer it's open** | Angular + RxJS | Tab memory climbs; handlers fire multiple times after navigation | `interval`/`valueChanges` subscriptions without teardown | Leaks, DevTools, lifecycle | 3 / 30m |
| 10 | **Background emails silently vanish** | Python worker (queue) | Jobs report success but some users get no email | Over-broad catch with debug-only logging; retry loop without backoff | Error handling, observability | 3 / 30m |
| 11 | **Works locally, broken in staging** | Node + Docker Compose | Staging hits the prod payment sandbox URL; fresh install fails tests | Misnamed env var silently falling back to a hard-coded default; unpinned dependency picks up a breaking minor | Config, dependency hygiene | 3 / 30m |
| 12 | **Flash sale oversells** | NestJS or Go + Postgres | Stock goes negative during load test | Check-then-act across `await`; fix with atomic conditional UPDATE or row lock | Concurrency, transactions | 4 / 40m |
| 13 | **Double charge after timeout** | Python (FastAPI) + payment mock | Some customers charged twice when the gateway is slow | Client retry on timeout + no idempotency key store; key reuse with different params not rejected | Idempotency, distributed reasoning | 4 / 45m |
| 14 | **The flaky checkout test** | Jest/Playwright or pytest | CI fails about 1 in 5 runs; someone added `sleep(2)` | Async wait + shared fixture order dependency; candidate must remove sleeps | Test reliability, async | 4 / 40m |
| 15 | **Add coupon codes** (feature extension) | TS full-stack (Angular/React + NestJS) | Product spec: percentage/fixed coupons, expiry, one per order | Existing float-money helper and missing transaction are latent traps; hidden edge-case tests (expired, stacking, concurrent redemption) | Reading code, feature design, AI collaboration | 4 / 60m |

**Stretch / later additions [Design]:**
- Android "form loses input on rotation" (`SavedStateHandle`) per the [Android docs](https://developer.android.com/topic/libraries/architecture/saving-states)
- Slack-style **PR review** challenge with 5 seeded issues
- Meta-style **3-phase capstone** (bug → feature → optimize on tiered inputs)
- A **"choose the right fix"** judgment item modeled on SWE-Lancer manager tasks ([OpenAI](https://openai.com/index/swe-lancer/))

---

## 11. Implications for our trainer

1. **Ship the formats real companies use.** Multi-file bug hunts, feature extensions and staged bug→feature→optimize mocks match Meta, Google and Stripe, and partial completion is normal. Code review and flaky-test tasks add Slack-style breadth.
2. **Grade with three layers:** hidden F2P/P2P/E2E plus property tests, a human-reviewed per-challenge rubric applied by an LLM judge, and process telemetry (repro-first, regression test, hypothesis log, AI-usage mix). "Tests green" must never be the whole score.
3. **Every challenge needs symptom/proximate/root-cause metadata and naive-fix traps,** so the product can tell real diagnosis from patching around the problem.
4. **Hints are hypothesis menus, rate-limited and costed.** Location-only hints are low value. The AI gate enforces per-challenge banned-leak patterns and steers toward conceptual help, the interaction style linked to better learning.
5. **Author from a green baseline, then seed.** Use mutations for warm-ups, hand-authored design faults for higher tiers, and combinations for capstones. Triple-annotate for spec clarity and test fairness, rerun hidden tests for flakiness, and pilot-time every challenge.
6. **Plan for contamination.** Families of renamed or re-skinned variants keep the gated AI (and the internet) from simply recalling answers, and enable spaced re-tests.
7. **Weight the catalogue toward what actually breaks apps:** logic and missing-case bugs inside features, access control, error handling, async/concurrency, data performance, config. Exotic bugs are flavor, not the core.
8. **Make training adaptive:** orientation drills → category tracks → interleaved mixed practice → timed mocks. Use skill-tag mastery to choose the next challenge, and schedule spaced re-attempts of failed families.
9. **The debrief is the product's teaching moment:** timeline, time to first correct hypothesis, root-cause explainer, accepted alternatives, AI-usage mix with a better prompt example, and the next recommended challenge.
10. **Start with 15 challenges across 5–6 stacks.** Suggested build order: #1, #2, #5, #6, #4 (one per major category) first, so the grading pipeline is validated before scaling.

---

## Sources

**Interviews and hiring practice**
- Hello Interview — Meta AI-enabled coding: https://www.hellointerview.com/blog/meta-ai-enabled-coding
- Hello Interview — Shopify AI-enabled coding: https://www.hellointerview.com/blog/shopify-ai-enabled-coding
- Northeastern Career Design — Google's AI-assisted coding interview (2026): https://careers.northeastern.edu/blog/2026/05/13/googles-ai-assisted-coding-interview-2026-guide/
- Canva Engineering — Yes, you can use AI in our interviews: https://www.canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews
- Canva Engineering — AI interview success: https://www.canva.dev/blog/engineering/ai-interview-success/
- techinterview.org — Stripe bug bash and API rounds: https://www.techinterview.org/post/3233476020/stripe-bug-bash-api-design-interview/
- techinterview.org — What interviewers grade when you can use Copilot: https://www.techinterview.org/post/3233476832/what-interviewers-grade-when-you-can-use-copilot/
- PracHub — Stripe bug squash guide: https://prachub.com/resources/stripe-bug-squash-interview-guide-how-to-debug-an-unfamiliar-codebase
- Slack Engineering — Refactoring backend engineering hiring: https://slack.engineering/refactoring-backend-engineering-hiring-at-slack/

**Benchmarks and grading research**
- OpenAI — Introducing SWE-bench Verified: https://openai.com/index/introducing-swe-bench-verified/
- SWE-bench Lite: https://www.swebench.com/lite
- SWE-Bench Pro (arXiv 2509.16941): https://arxiv.org/html/2509.16941v2
- SWE-bench Multimodal (arXiv 2410.03859): https://arxiv.org/abs/2410.03859
- OpenAI — SWE-Lancer: https://openai.com/index/swe-lancer/
- DebugBench (arXiv 2401.04621): https://arxiv.org/abs/2401.04621
- SWE-smith (arXiv 2504.21798): https://arxiv.org/abs/2504.21798v1 ; pipeline summary: https://www.emergentmind.com/topics/swe-smith-pipeline
- Just et al., Are mutants a valid substitute for real faults? (FSE 2014): https://cs.ubc.ca/~rtholmes/papers/fse_2014_just.pdf
- Wang et al., Are "Solved Issues" in SWE-bench Really Solved Correctly? (arXiv 2503.15223): https://arxiv.org/abs/2503.15223
- BloomAPR (arXiv 2509.25465): https://arxiv.org/pdf/2509.25465
- Human-in-the-loop LLM-as-judge for patch evaluation (arXiv 2511.10865): https://arxiv.org/html/2511.10865v1

**Bug studies, security and postmortems**
- Tan et al., Bug characteristics in open source software (EMSE 2014): https://www.cs.purdue.edu/homes/lintan/publications/bugchar-emse14.pdf
- Lu et al., Learning from Mistakes (concurrency bugs): https://www.microsoft.com/en-us/research/?p=1123215
- Davis et al., Node.fz (via The Morning Paper): https://blog.acolyer.org/2017/06/09/node-fz-fuzzing-the-server-side-event-driven-architecture/
- Yuan et al., Simple Testing Can Prevent Most Critical Failures (via The Morning Paper): https://blog.acolyer.org/2016/10/06/simple-testing-can-prevent-most-critical-failures/
- Luo et al., An Empirical Analysis of Flaky Tests: https://huang.isis.vanderbilt.edu/cs8395/paper/flakytest.pdf
- Hashemi et al., An Empirical Study of Flaky Tests in JavaScript: https://ar5iv.labs.arxiv.org/html/2207.01047
- Google SRE Workbook — Postmortem analysis: https://sre.google/workbook/postmortem-analysis
- OWASP Top 10:2025 introduction: https://top10.owasp.org/2025/0x00_2025-Introduction/
- The Register — OWASP Top 10 2025 coverage: https://www.theregister.com/2025/11/11/new_owasp_top_ten_broken/
- APISecurity.io — API1:2023 BOLA: https://apisecurity.io/owasp-api-security-top-10/api1-2023-broken-object-level-authorization/

**Bug-category technical references**
- React docs — You Might Not Need an Effect: https://react.dev/learn/you-might-not-need-an-effect.md
- Zühlke — RxJS memory leaks in Angular: https://software-engineering-corner.zuehlke.com/rxjs-memory-leaks-in-angular
- AppSignal — N+1 queries explained: https://blog.appsignal.com/2020/06/09/n-plus-one-queries-explained
- CYBERTEC — Foreign keys and indexes in PostgreSQL: https://www.cybertec-postgresql.com/en/?p=4662
- CockroachDB docs — Pagination: https://docs.cockroachlabs.com/docs/stable/pagination.md
- techinterview.org — Where caching helps and where it bites: https://www.techinterview.org/post/3233476413/where-caching-helps-and-where-it-bites/
- Zain Rizvi — Falsehoods programmers believe about time zones: https://zainrizvi.io/blog/falsehoods-programmers-believe-about-time-zones/
- DEV — JS Date constructor time zone oddity: https://dev.to/apisurfer/js-date-constructor-timezone-oddity-2boj
- Evan Jones — Floating point and money: https://evan-jones.appspot.com/floating-point-money.html
- DEV — Race conditions in APIs: https://dev.to/fazal_mansuri_/race-conditions-in-apis-the-bug-you-cant-see-5c0h
- Stripe docs — Idempotent requests: https://docs.stripe.com/api/idempotent_requests.md
- The Twelve-Factor App — Config: https://12factor.net/config
- Android Developers — Save UI states: https://developer.android.com/topic/libraries/architecture/saving-states

**Learning science and debugging education**
- Anthropic — How AI assistance impacts the formation of coding skills: https://www.anthropic.com/research/AI-assistance-coding-skills
- Alaboudi & LaToza, Using Hypotheses as a Debugging Aid: https://par.nsf.gov/servlets/purl/10206972
- McCauley et al. 2008 extracts (debugging education): https://www.tech.dmu.ac.uk/~djohns02/notes/modules/education/EDUC2323/2021/content/Week%203%20Guess%20the%20Number/Handout_ExtractsFromMcCauleyEtAl2008.pdf
- LearnLab — Help abuse / clicking through hints: https://learnlab.org/research/wiki/index.php/Help_abuse
- APS — Which study strategies make the grade (Dunlosky et al. 2013): https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html
- Rohrer et al. 2014 — Interleaved practice (Psychonomic Bulletin & Review): https://link.springer.com/article/10.3758/s13423-014-0588-3
