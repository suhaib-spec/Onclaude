# 01 — How Companies Run AI-Assisted Coding Interviews (2025–2026)

*Research date: 2026-11-11. Scope: what real companies and interview platforms do when candidates may (or must) use an AI assistant during a coding interview, how they score it, and what that means for our trainer.*

---

## 0. How to read this report

Every claim links to a source in the **Sources** list at the end (`[S#]`). Each claim also carries an evidence label:

| Label | Meaning |
|---|---|
| **[Official]** | Published by the hiring company itself (engineering blog, careers page, candidate guidance). |
| **[Vendor]** | Published by an interview platform about its own product (docs, product blog). Accurate about the product, but promotional. |
| **[Press]** | News coverage, often based on internal documents seen by a reporter. |
| **[Prep-site]** | Interview-prep companies (Hello Interview, PracHub, IGotAnOffer, Exponent, Formation, etc.) that compile candidate reports. Useful, but secondhand. Most sell prep products. |
| **[Anecdotal]** | Individual candidate posts (Reddit, LeetCode Discuss, Blind, personal blogs). Small samples, unverified. |

Where sources disagree, both versions are given.

---

## 1. Executive summary

1. **AI-assisted rounds are now mainstream but not universal.** In CoderPad's 2026 survey of hiring teams, 46% allow AI in some form in technical interviews, 20% decide per case, and 34% still ban it [S32] **[Vendor survey]**. Most companies that allow AI keep at least one no-AI round (Meta keeps a classic round [S1]; Google's change is a pilot [S15]).
2. **Two dominant formats** [S3] **[Prep-site]**:
   - **Structured / existing-codebase:** the company provides a browser IDE, a multi-file codebase it wrote, a fixed set of AI models, and a staged problem: fix a bug, then add a feature, then optimize or scale. Reported at Meta, LinkedIn, Uber, Google (pilot), and Karat-run interviews [S1][S3][S14][S16][S43].
   - **Open-ended / greenfield:** the candidate uses their own IDE and AI tools, starting from an empty repo or a README, and the interviewer watches over screen share. Reported at Shopify, Canva, and Rippling [S3][S10][S12].
3. **The existing-codebase format is the one our product targets, and it is the growing one.** Google's pilot asks candidates to read, debug, and optimize existing code with Gemini [S15][S16]. Coinbase moved backend interviews to debugging, review, and rollback work inside existing repos [S25]. Codility, HackerRank, CoderPad, and Karat all now ship multi-file "repository" or "project" question types with an embedded AI [S30][S36][S43][S46].
4. **Several platforms already ship a restricted ("guarded") AI mode, the same idea as our gated assistant.** HackerRank's guarded mode helps with syntax, platform navigation, and concepts but withholds complete solutions [S35][S36]. CodeSignal's "Guided Support" mode is limited to navigation, syntax errors, and docs [S39]. Codility's chat assistant, Cody, explains requirements and points to docs [S45]. Candidates report that Meta's assistant is less helpful than in practice, possibly because of a restrictive system prompt [S1] **[Prep-site, unverified]**.
5. **Interviewers see everything.** Platforms record the full candidate-AI transcript and support session playback. Some add diffs against the starting code and paste detection [S29][S30][S35][S39][S45][S46]. HackerRank now auto-grades "AI Fluency" (A/B/C) from the transcript and IDE activity [S37].
6. **Scoring converges on the same handful of signals**, whichever company runs the interview: problem understanding and decomposition, ownership of design decisions, **verification and catching AI mistakes** (the top signal hiring teams cite [S32]), code quality, debugging, testing, and continuous narration. **How often** a candidate uses AI is explicitly *not* scored at Meta, Karat, or Canva [S6][S44][S11].
7. **The most common failures** are behavioral, not technical: prompting before understanding the problem or the codebase, pasting large unreviewed AI output, going silent while prompting, not running tests, and being unable to explain AI-written code [S1][S6][S9][S11][S12].

---

## 2. The policy landscape

### 2.1 Overall adoption

- CoderPad's *State of Tech Hiring 2026* (650+ respondents, published March 2026) reports these policies among hiring teams [S32][S33] **[Vendor survey]**:

  | Policy | Share |
  |---|---|
  | Ban AI entirely | 34% |
  | Allow AI with constraints | 29% |
  | Allow AI broadly | 17% |
  | Decide case by case | 20% |

- In the same survey, the signals hiring teams most value when AI is allowed are [S32]:

  | Signal | Share |
  |---|---|
  | Catches and fixes AI mistakes | 66% |
  | Explains trade-offs and correctness | 56% |
  | Improves AI output by iterating | 28% |
  | Handles edge cases and failures | 28% |
  | Considers security and privacy | 25% |

- **Rule of thumb:** assume AI is off unless the recruiter says otherwise, and ask which rounds allow it. Every prep source gives this advice [S3][S23][S24] **[Prep-site]**.

### 2.2 Companies that still restrict AI by default

- **Amazon:** In early 2025, internal guidance told candidates not to use GenAI tools in interviews unless explicitly permitted, and warned that violations may lead to disqualification [S18] **[Press, internal docs via Business Insider]**. Candidate reports from 2026 describe some Amazon online assessments that include a built-in AI assistant for an existing-repository section. These reports are corroborated across candidates but unofficial [S19] **[Prep-site/Anecdotal]**.
- **Anthropic:** Its candidate guidance (updated July 2025) says no AI in live interviews or take-homes unless Anthropic states otherwise [S20] **[Official]**. Its performance-engineering take-home is one such exception, where AI use is explicitly allowed [S21] **[Official]**.
- A June 2026 prep article lists Google, Meta, and Amazon as "strict no-AI" for live rounds [S23] **[Prep-site]**. This is **out of date or overstated**: Meta and Google both run AI-enabled rounds alongside no-AI rounds [S1][S15].

---

## 3. Company-by-company

### 3.1 Meta: AI-enabled coding round (the reference "existing codebase" format)

| Aspect | Details | Evidence |
|---|---|---|
| Rollout | Began appearing around October 2025 [S1][S7]. CoderPad described it as a pilot on its platform in an Oct 30, 2025 post [S4]. | Prep-site, Vendor, Anecdotal |
| Place in loop | Replaces one of the two onsite coding rounds; one classic no-AI round remains [S1][S5]. One source says E7+ candidates get only the AI round [S5]; another says the format covers SWE/EM up to E7/M2 [S1]. **Conflicting.** | Prep-site |
| Duration | 60 min; about 5–6 min of orientation, leaving roughly 30–40 min of real implementation time [S1]. | Prep-site |
| Environment | CoderPad, three panels: file explorer, editor, and AI chat plus instructions. A "Run Tests" button runs the unit tests [S1][S5]. | Prep-site |
| AI capability | The AI can read the project files, but **it answers only in chat and cannot edit files**. The candidate types or pastes all code [S1][S5]. | Prep-site |
| Models | Expanded over time. Early reports listed GPT-4o mini, Claude 3.5 Haiku, and Llama 4 Maverick [S7]. Later reports list GPT-5, Claude Haiku/Sonnet 4–4.5, Opus 4, Gemini 2.5 Pro, and others [S1][S8]. | Prep-site, Anecdotal |
| Codebase | Multi-file code the candidate did not write: classes, data models, existing tests, and config (e.g. several `.py` files plus `requirements.txt`) [S5][S7]. One source puts it at a few hundred lines [S6]. | Prep-site, Anecdotal |
| Problem arc | **(1) Fix a bug**, usually non-algorithmic: type casting, off-by-one, or a wrong conditional. **(2) Implement the core feature or algorithm**, estimated at 120+ lines and harder than a LeetCode medium. **(3) Optimize**, where larger tiered test inputs break the phase-2 solution, and the test data often hints at the needed algorithm change [S1]. Some reports describe 4–5 checkpoints, with the first three usually considered enough [S8]. | Prep-site, Anecdotal |
| AI restrictions | Some interviewers forbid AI in phase 1 [S1][S8]. Candidates report the AI being weaker than in practice and possibly told not to volunteer bugs or full solutions [S1]. | Prep-site, Anecdotal (unverified) |
| Scoring | Same four areas as classic Meta coding: problem solving, code quality and understanding, verification and debugging, and communication [S1][S7]. AI use is optional, and frequency of use is not scored, per a Meta EM quoted by IGotAnOffer [S6]. | Prep-site |
| Completion | Not finishing every phase is OK. Candidates report offers without completing phase 3 [S1]. | Prep-site |
| Practice | Meta offers a practice pad with a sample puzzle on request through the recruiter [S1][S8]. | Prep-site, Anecdotal |

### 3.2 Google: "code comprehension" round with Gemini (pilot, 2026)

- In May 2026, Business Insider reported on an internal document describing a **human-led, AI-assisted** interview pilot. Junior and mid-level SWE candidates on select US teams use an approved AI assistant, confirmed to be Gemini, to **read, debug, and optimize an existing codebase** [S15][S16] **[Press]**.
- The internal document reportedly evaluates "AI fluency," covering prompt engineering, output validation, and debugging [S15][S16] **[Press]**.
- An October 2026 report says the pilot has expanded beyond its initial small group, but the scoring method is still not public [S17] **[Press]**.
- Exponent reports, from candidate interviews, that candidates who leaned on AI without showing understanding got negative feedback, and that communication matters heavily [S16] **[Prep-site/Anecdotal]**.
- Unknown: duration and environment [S16].

### 3.3 Canva: AI use expected

- Since June 2025, Canva expects backend, frontend, and ML candidates to use AI tools (Copilot, Cursor, and Claude are named). The "AI-Assisted Coding" competency replaces its CS-fundamentals screen [S10] **[Official]**.
- Problems were redesigned to be ambiguous and to require more than one prompt. The published example is an air-traffic takeoff/landing control system [S10] **[Official]**.
- Format: the candidate works in their own AI-integrated IDE, and the interviewer assesses both process and final code. Interviewers may ask questions that candidates should **answer themselves before turning to AI** [S11] **[Official]**.
- Scoring areas: engineering problem-solving (decomposition, scope, edge cases), technical depth and ownership (understanding and defending the code, production standards), and AI collaboration (using AI for suitable tasks and critiquing its output) [S11] **[Official]**.
- Canva found that candidates who struggled lacked the judgment to steer AI or spot weak suggestions, not the ability to code [S10] **[Official]**.

### 3.4 Shopify: open-ended, bring your own tools

- Shopify's VP Engineering said Shopify doesn't ban AI in remote interviews. He values candidates who let AI do most of the work but can still read the code and pinpoint the wrong line. He has watched candidates re-prompt the AI to fix a trivial bug rather than make a one-character edit [S13] **[Official, podcast interview]**.
- Reported format: Google Meet screen share; your own IDE and any AI tool (Cursor, Claude Code, ChatGPT, Copilot). A GitHub repo is shared minutes before the start, empty or containing only a README. You push your code at the end. One problem grows through interviewer follow-ups, e.g. robot grid navigation, an LRU cache, or Unix `tail` [S12] **[Prep-site]**.
- Reported scoring: problem breakdown, giving the AI context, class design and extensibility, cleaning up AI code, tests, handling bad AI output, narration, and product thinking [S12] **[Prep-site]**.

### 3.5 LinkedIn: CoderPad, chat-only AI

- Reported format: one of two onsite coding rounds is AI-enabled. It runs in CoderPad with an AI chat panel that cannot edit code. Problems include an LRU cache, an LFU cache, a merge-intervals variant at Staff level, and structured-data processing. Follow-ups cover concurrency, scale, and production readiness [S14] **[Prep-site]**.
- Reportedly scored on a 4-point scale, where 3 is a pass, on prompt quality, verification, production thinking, and communication [S14] **[Prep-site, unverified]**.

### 3.6 Rippling

- Prep sources list Rippling as open-ended: own IDE, building features incrementally against test cases [S3] **[Prep-site]**. One prep site says AI is permitted and that the bar rises when you use it, but it gives no sources [S22] **[Prep-site, unsourced]**.

### 3.7 Coinbase: AI fluency across the whole loop

- Coinbase's engineering blog (summarized by third parties; the original was not fetchable) describes three phases. In H2 2025 they ran a frontend pilot and found that switching AI on without changing questions let AI solve them. In January 2026 they added backend questions built on **debugging, code review, and rollback inside existing repositories**. In March 2026 they added AI-fluency criteria to every round [S25][S26] **[Official via secondary summary]**.
- The framework has three axes: *usage*, *application* (where AI fits in a workflow), and *understanding limits* (including privacy and security) [S25].
- Coinbase says questions have a short **"half-life"** as models improve, so it reviews them quarterly [S25].

### 3.8 Stripe, Atlassian, Uber, DoorDash, Microsoft (mostly candidate reports)

- **Stripe:** Candidates report an AI coding round on a HackerRank-style platform with a built-in assistant. A common task is a transaction rule engine that grows in stages. Stripe publishes no rubric. Stripe's separate "Bug Squash" round asks candidates to debug an unfamiliar existing codebase [S27] **[Prep-site/Anecdotal]**.
- **Atlassian:** Candidates report a live round in a HackerRank repository with Plan and Agent modes and a debugging or feature task, e.g. fixing password-logic bugs with an agent. Atlassian has not published an official AI-round description [S28] **[Prep-site/Anecdotal]**.
- **Uber:** Reported to use HackerRank with a preset repository that must be navigated before changes are made [S3] **[Prep-site]**.
- **DoorDash:** Candidates report an "AI Code Craft" or debugging session in unfamiliar code [S19] **[Anecdotal]**.
- **Microsoft:** AI-assisted rounds are reportedly limited to AI-focused orgs. Candidates do focused tasks in VS Code with Copilot, according to a Microsoft principal EM quoted by IGotAnOffer [S6] **[Prep-site]**.

### 3.9 Summary table

| Company | Format | Codebase | AI surface | Evidence |
|---|---|---|---|---|
| Meta | Structured, 60 min | Existing multi-file; bug → feature → optimize | CoderPad chat, read-only on files | Prep-site, Anecdotal |
| Google (pilot) | Structured | Existing code: read, debug, optimize | Gemini | Press |
| LinkedIn | Structured | Partly scaffolded or from data | CoderPad chat, no edits | Prep-site |
| Uber | Structured | Preset repo | HackerRank | Prep-site |
| Coinbase | Repo-based debugging | Existing repos (debug, review, rollback) | Not specified | Official (secondary) |
| Stripe | Platform AI round + Bug Squash | Greenfield (AI round); existing (Bug Squash) | HackerRank-style chat | Anecdotal |
| Atlassian | Live repo task | Existing repo | HackerRank Plan/Agent | Anecdotal |
| Shopify | Open-ended | Empty repo or README | Any tool, own IDE | Official + Prep-site |
| Canva | Open-ended | Greenfield, ambiguous spec | Own AI IDE (required) | Official |
| Rippling | Open-ended | Incremental build with tests | Own IDE | Prep-site |
| Amazon | Mostly no AI; some OAs with AI repo section | Existing repo (OA) | Built-in assistant | Press, Anecdotal |
| Anthropic | No AI unless stated | n/a | n/a | Official |

---

## 4. Interview platforms and how their AI is configured

### 4.1 Comparison

| Platform | AI modes | Restriction / gating options | What the interviewer sees | Scoring |
|---|---|---|---|---|
| **HackerRank** | Plan, Ask, Agent (file edits approved per tool call), inline completions, model switching [S35] | **Guarded:** syntax, navigation, and concepts only, with no complete solutions. **Unguarded:** full agent. Coding questions default to guarded; Code Repo questions default to unguarded [S36]. AI can be turned off per question. Admins pick the models, and system instructions can be set per project question in unguarded mode [S35]. | Live AI panel, observation mode with synced edits and diffs, **diff vs. starting state**, full chat transcript in the report [S35][S36] | **AI Fluency grade (A/B/C/NA)**, LLM-generated from the transcript and IDE activity, across three dimensions: context quality, critical thinking, and collaboration. Each dimension links to evidence excerpts [S37]. |
| **CoderPad** | Ask, Edit, and Plan modes; candidate picks among Claude, GPT, and Gemini models [S29][S30] | No documented interviewer-side prompt restriction [S29]. Integrity tooling: paste detection in project playback, "copied all code" alerts, extension controls [S30]. | Live view of edits and AI use, private notes, **playback of prompts, AI replies, and edits** [S29]. Multi-file "Projects" with one-click tests and a diff view [S30]. | Human scorecard. CoderPad publishes a 5-skill AI-fluency framework (§5.2) [S31]. |
| **CodeSignal** | Cosmo assistant: **Full Co-Pilot** or **Guided Support** (navigation, syntax, docs) [S39]. 2026 agentic assessments are built around Claude Code, Cursor, and Codex-style workflows [S40][S41]. | Mode chosen by the employer [S39] | Full AI transcript plus session replay [S39] | No automatic AI scoring described. Human review against stated areas: problem interpretation, AI use, and validating AI output [S39][S40]. |
| **Karat (NextGen)** | Integrated assistant that can generate code, answer codebase questions, and give hints. It may propose a plan before changes and offer one-click apply [S43]. | **No outside tools.** Only the in-platform AI is allowed [S43]. Questions are designed so AI can't solve them alone [S42]. | Human Interview Engineer, live [S42][S43] | Published human+AI rubric (§5.3) [S44] |
| **Codility** | Cody chat assistant explains requirements, gives examples, and points to docs [S45]. Newer agentic tasks put Claude Code or Codex CLI in a VS Code terminal [S46]. | AI can be toggled per test or task. Some tasks **deliberately contain assistant errors** for the candidate to catch [S46]. | Full transcript; read-only live view; replay of what was asked, accepted, rejected, and fixed [S45][S46] | AI-usage metrics don't change automatic task scores. Live interviews use a human rubric. An "AI Output Validation" skill is linked to specific prompts [S46]. |

### 4.2 Takeaways

- **Restricted assistants are an industry pattern.** HackerRank (guarded), CodeSignal (Guided Support), and Codility (Cody) all offer an assistant that helps without solving [S36][S39][S45]. Our gated assistant fits this pattern. The trade-off is that many real repository rounds now use unguarded or agent modes [S36][S46], so our assistant is stricter than what candidates will often face.
- **Chat-only vs. agent.** Meta and LinkedIn reportedly use chat-only AI that can't edit files [S1][S14], while HackerRank, CoderPad, and Codility now offer edit or agent modes [S30][S35][S46]. Candidates need practice with both.
- **Full transcripts are standard.** Every major platform records the candidate-AI conversation for review [S29][S35][S39][S45][S46]. The prompts themselves are evidence.

---

## 5. Evaluation rubrics and signals

### 5.1 Company rubrics at a glance

| Source | Dimensions |
|---|---|
| Meta (reported) | Problem solving · code quality and understanding · verification · communication [S1] |
| Canva (official) | Engineering problem-solving · technical depth and ownership · AI collaboration [S11] |
| Google (internal doc, reported) | AI fluency: prompting · output validation · debugging [S15] |
| Coinbase (official, secondary) | Usage · application · understanding limits [S25] |
| LinkedIn (reported) | Prompt quality · verification · production thinking · communication [S14] |

### 5.2 CoderPad's "5 skills" AI-fluency framework (April 2026) [S31] **[Vendor]**

1. **Strategic use of AI.** Who drives the work, the candidate or the AI? This is the only skill with an explicit 1–5 scale: 1–2 means the AI drives, 3–4 means deliberate use, 5 means the candidate directs the AI's strategy throughout.
2. **Problem framing.** Did the candidate break the problem down and define "done" before prompting?
3. **Explanation, ownership, and architectural reasoning.** Can they explain the trade-offs in AI-written code? CoderPad calls this the most important skill.
4. **Critical evaluation and edits.** Do they treat AI output as untrusted, check edge cases, and push back?
5. **Problem solving.** Does AI speed them up or derail them? How quickly do they recover from bad output?

Sample interviewer probes from this framework (worth reusing in our interviewer simulation): what did you want AI to do here; walk me through your breakdown; would you ship this; what's fragile; how would you do it without AI [S31].

### 5.3 Karat's human+AI rubric [S44] **[Vendor]**

- Competencies: code productivity (including **navigating the codebase independently**), code quality, product sense and problem solving (clarifying ambiguity, test cases, debugging), communication, complexity analysis, and **AI proficiency** (scoping prompts and evaluating AI code).
- Rules: don't penalize or reward AI use itself. Score observable actions, not intent. Give credit when a candidate catches a hallucination and re-prompts. Uncritical acceptance of AI output is a red flag.
- Observable codebase-navigation behaviors: opening the right files and modules, using AI to speed up understanding, and avoiding aimless exploration.

### 5.4 HackerRank: Direction, Supervision, Verification [S37][S38] **[Vendor]**

- They define AI fluency as the ability to direct, supervise, and verify AI toward shippable work [S38].
- **Direction:** the candidate sets constraints and owns the plan instead of taking the agent's first plan. **Supervision:** they watch for drift and redirect early instead of only checking the final output. **Verification:** they can explain why each file changed and find bugs the agent missed, instead of stopping at "it runs" [S38].
- The automated grade measures quality over quantity of AI use, and NA (too little AI use) is not a failing grade [S37].

### 5.5 Consolidated signal list

| Signal | What strong looks like | Sources |
|---|---|---|
| Problem understanding | Restates the task, asks clarifying questions, and plans before prompting | [S6][S10][S11][S31] |
| Codebase navigation | Reads the relevant files first, finds the right modules, and uses AI to summarize code rather than to solve | [S1][S44] |
| Directing the AI | Scoped prompts with context and constraints; the candidate makes the architecture calls | [S1][S12][S38][S44] |
| Verification | Runs tests after every change, reviews AI output, catches AI errors, re-runs the full suite | [S1][S7][S32][S46] |
| Debugging | Reproduce, isolate, hypothesize, fix, verify; can debug without AI | [S6][S44] |
| Testing | Writes their own tests and edge cases; doesn't rely only on the existing tests | [S12][S38][S47] |
| Code quality | Cleans up AI code (names, magic numbers); fits existing structure and APIs | [S6][S12] |
| Explanation and ownership | Can explain every line and trade-off; would-you-ship-it reasoning | [S11][S31] |
| Communication | Narrates intent before each prompt and reviews output aloud | [S1][S6][S12] |
| Time management | Gets a working baseline fast; explains the optimal approach even if out of time | [S1][S14] |

---

## 6. Common candidate mistakes

| Mistake | Notes | Sources |
|---|---|---|
| **Prompting before thinking** | Pasting the problem into the AI with no plan of your own | [S2][S12][S47] |
| **Skipping codebase reading** | One candidate called it their biggest regret. About 5 min of reading reportedly saves about 15 min of debugging. | [S1] **Anecdotal** |
| **Large unreviewed pastes** | Treated as a red flag; requesting 100+ lines you can't verify | [S5][S7] |
| **Going silent while prompting** | Reportedly lowers the communication score. CoderPad's own hiring guidance also lists long silences and accepting unchecked AI output as weak signals. | [S6][S34][S48] |
| **Not running code or tests often** | One rubric flags fewer than 5 test runs in 60 min | [S1][S9] **Prep-site** |
| **Over-trusting AI** (accepting architecture, complexity claims, or edge cases) | Example: an AI docstring claims O(1) while the code is O(k) | [S9][S47] |
| **Asking AI to solve everything** | Broad prompts produce unusable or hallucinated output | [S1][S6] |
| **"AI Showcase" / "Feature Marathon" / "Hands-Off"** | Canva's three named anti-patterns: showing off AI tricks, racing through features, and delegating without review | [S11] **Official** |
| **Re-prompting for trivial fixes** | Asking the AI to fix what is a one-character edit | [S13] **Official (podcast)** |
| **Code that ignores the surrounding codebase** | Not following the existing APIs, dependencies, or structure | [S6] |
| **Debugging AI output too long** | Sometimes slower than writing the code by hand | [S1] |
| **No fallback when the AI is weak** | The provided model may be weaker than the tools candidates use at work | [S1][S9] **Anecdotal** |

---

## 7. Recommended candidate strategy (synthesized)

This workflow combines the official guidance [S10][S11] with prep sources [S1][S6][S12][S28][S47]:

1. **Orient (about 5 min):** read the README and tests, skim the file structure, find the entry points, and run the existing tests to see what's failing [S1][S28].
2. **Frame:** restate the task, ask clarifying questions, and name two or three approaches with reasons for picking one [S11][S47].
3. **Answer first, then use AI:** give your own answer before consulting the AI when the interviewer asks a question (Canva), and consider doing the phase-1 bug fix without AI (Meta) [S1][S11].
4. **Direct in small steps:** write narrow prompts with context and constraints; use AI for boilerplate, syntax, explaining unfamiliar code, and test ideas [S1][S5][S6].
5. **Verify every step:** prompt, review, run, confirm. Check complexity claims and edge cases against the actual code [S1][S47].
6. **Narrate continuously:** say what you're about to ask and why, then react to the output out loud [S1][S6][S12].
7. **Clean up and explain:** remove AI clutter, then explain the trade-offs and what production would still need [S11][S12].
8. **When time is short:** describe the optimal approach in words [S1].

One Reddit commenter disputes a popular tip, prompting the AI while talking to the interviewer, as costly context switching [S7] **[Anecdotal]**. The trainer should present it as optional.

---

## 8. Open questions and conflicts

- **Meta's level scope** (E7+ only AI round vs. up to E7) conflicts across sources [S1][S5].
- **Whether Meta's assistant is deliberately weakened** is reported by candidates and not confirmed by Meta [S1][S9].
- **Official rubrics are scarce.** Canva is the only company here that published detailed criteria [S11]. Coinbase has a public post, which this research reached only through summaries [S25]. Everything else is press reports of internal documents or prep-site compilations.
- **Question decay:** Coinbase and Anthropic both report that AI quickly catches up to interview questions [S21][S25]. Any fixed problem bank will age.
- **Predictive validity:** Coinbase is still testing whether interview AI fluency predicts on-the-job AI fluency [S25].

---

## 9. Implications for our trainer

Each requirement below is phrased as a product requirement and cites the evidence behind it.

### 9.1 Session format

- **R1. The primary mode is an existing-codebase session**: a multi-file project (a few hundred lines) with existing tests and config, written by "someone else." This matches Meta, Google, Uber, Karat, Coinbase, and Atlassian [S1][S6][S15][S25][S43].
- **R2. Support a staged problem arc**: Phase 1 bug fix (non-algorithmic: off-by-one, type casting, wrong conditional), Phase 2 feature implementation, Phase 3 optimization triggered by tiered or larger hidden test inputs whose shape hints at the fix [S1]. Partial completion should still be scorable [S1].
- **R3. Default to a 60-minute timer with a short orientation segment**, plus a configurable shorter screen of 30–45 min [S1][S43].
- **R4. Allow per-phase AI disabling.** Some interviewers forbid AI in phase 1 [S1][S8], and companies keep no-AI rounds [S1][S16].
- **R5. Defer a greenfield mode** (empty repo plus README, growing requirements) as a secondary mode for Shopify, Canva, and Rippling-style prep [S3][S10][S12].
- **R6. Offer a familiar layout**: file explorer, editor, AI chat with instructions, a Run Tests button, and output and test panels, mirroring CoderPad and HackerRank [S1][S30][S35]. Offer a choice of Python, Java, TypeScript, and C++ at minimum [S1][S43].

### 9.2 The gated assistant

- **R7. Model the gate on established "guarded" modes.** The assistant may help with syntax, language and library docs, concepts, navigation ("where is X defined?"), explaining existing code, and Socratic prompts. It must never produce the fix, the feature code, or a near-equivalent [S36][S39][S45].
- **R8. Tell users explicitly** that many real rounds allow full code generation or agent mode [S35][S46]. The gate trains the judgment those rounds score, not delegation speed. Consider a later "unguarded practice" tier only if the owner wants it (a product decision, out of scope here).
- **R9. Train verification inside the gate.** Seed the codebase with "AI-written" code or past diffs that contain plausible errors (Codility does this deliberately [S46]), and have the assistant occasionally make confident but checkable claims, such as a wrong complexity claim [S47]. This lets users practice catching AI mistakes, the top signal hiring teams cite [S32]. *(This needs owner sign-off, since it changes how the assistant behaves.)*
- **R10. Restrict the assistant to its in-app panel**, matching real platforms where only the built-in AI is allowed [S43]. Offer a chat-only mode (Meta/LinkedIn style) by default [S1][S14].

### 9.3 Capture and scoring

- **R11. Record everything** interviewers would see: the full AI transcript, code edit timeline/playback, diff vs. starting state, test-run log, and paste events [S29][S30][S35][S46].
- **R12. Capture think-aloud narration.** Communication is scored everywhere [S1][S6][S11]. Support voice-to-text or a typed narration channel, and flag silent stretches during prompting [S6][S48].
- **R13. Use a rubric of about 7 dimensions** drawn from §5.5: problem understanding, codebase navigation, AI direction, verification and testing, debugging, code quality and ownership, and communication and time management. Score observable actions only, never raw AI-usage frequency [S6][S44].
- **R14. Detect behavioral anti-patterns automatically**: time to first prompt vs. time spent reading files; "solve it for me" prompts; large pastes; number and spacing of test runs (fewer than 5 per hour is a flag [S9]); not re-running the full suite after changes; prompting for trivial edits [S13]; and no tests written by the user [S1][S9][S11][S12].
- **R15. Make the feedback report evidence-linked**: a grade per dimension, each tied to transcript or code excerpts, as HackerRank does [S37], plus named anti-patterns such as Canva's three [S11] and concrete next-session drills.

### 9.4 Interviewer simulation

- **R16. Simulate an interviewer** who asks orientation questions, requires an answer **before** AI use on some questions [S11], and probes with the CoderPad-style questions: why this, trade-offs, would you ship it, what's fragile, how would you do it without AI [S31]. It should add follow-ups when scope grows (concurrency, scale, production readiness) [S14].

### 9.5 Content

- **R17. Build a problem bank** around reported themes: LRU/LFU caches, rule engines, grid/robot navigation, interval merging, rate limiters, data-processing classes, and debugging and rollback in realistic service code [S1][S12][S14][S25][S27][S47].
- **R18. Version and rotate problems**, since questions go stale as models improve (Coinbase reviews quarterly) [S25][S21].
- **R19. Include drills for prep sources' top advice**: codebase-reading drills, a "reproduce, isolate, hypothesize, fix, verify" debugging drill [S6], and "explain the optimal approach when out of time" practice [S1].

---

## Sources

| ID | Source | Type | Date |
|---|---|---|---|
| S1 | [Hello Interview: Meta's AI-Enabled Coding Interview](https://www.hellointerview.com/blog/meta-ai-enabled-coding) | Prep-site | 2025–26 |
| S2 | [Hello Interview: AI Coding learning hub](https://www.hellointerview.com/learn/ai-coding) | Prep-site | 2026 |
| S3 | [Hello Interview: AI-enabled interview formats](https://www.hellointerview.com/learn/ai-coding/overview/interview-formats) | Prep-site | 2026 |
| S4 | [CoderPad: AI in the interview is not cheating, it is the job (Meta)](https://coderpad.io/blog/hiring-developers/ai-in-the-interview-is-not-cheating-it-is-the-job-according-to-meta/) | Vendor | 2025-10-30 |
| S5 | [DG Learning: Inside Meta's New AI-Enabled Coding Round](https://dglearning.substack.com/p/inside-metas-new-ai-enabled-coding) | Prep-site | 2026-04-17 |
| S6 | [IGotAnOffer: AI-assisted coding interview](https://igotanoffer.com/en/advice/ai-assisted-coding-interview) | Prep-site (quotes Meta and Microsoft EMs) | 2026-06-02 |
| S7 | [r/leetcode thread: Meta's new AI-enabled coding round is live (mirror)](https://libreddit.winscloud.net/r/leetcode/comments/1o47lk2/officially_live_metas_new_aienabled_coding_round/nj8sj49/?context=3) | Anecdotal | ~Oct 2025 |
| S8 | [Reddit snapshot: Meta new-grad AI-enabled coding round](https://reddit.sentinel-team.org/posts/1plev9g/snapshots/2025-12-13T09%3A31%3A12.30116Z) | Anecdotal | 2025-12 |
| S9 | [DSA Handbook: Meta's AI round common failures](https://handbook-dsa.pages.dev/curriculum/interview-framework/meta-ai-round-failures/) | Prep-site (meta-analysis) | 2026 |
| S10 | [Canva Engineering: Yes, you can use AI in our interviews](https://canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews) | Official | 2025-06-11 |
| S11 | [Canva Engineering: AI interview success, an interviewer's inside guide](https://www.canva.dev/blog/engineering/ai-interview-success/) | Official | 2025-10-20 |
| S12 | [Hello Interview: Shopify AI-enabled coding](https://www.hellointerview.com/blog/shopify-ai-enabled-coding) | Prep-site | 2026 |
| S13 | [The Pragmatic Engineer: How AI is changing software engineering at Shopify (Farhan Thawar)](https://newsletter.pragmaticengineer.com/p/how-ai-is-changing-software-engineering) | Official (exec interview) | 2025-07-02 |
| S14 | [Hello Interview: LinkedIn AI-enabled coding](https://www.hellointerview.com/blog/linkedin-ai-enabled-coding) | Prep-site | 2026 |
| S15 | [Yahoo Finance/Moneywise: Google will let candidates use AI in interviews](https://finance.yahoo.com/sectors/technology/articles/asking-kid-math-test-without-151500986.html) | Press (cites Business Insider) | 2026-05-14 |
| S16 | [Northeastern Careers (Exponent): Google's AI-Assisted Coding Interview 2026 Guide](https://careers.northeastern.edu/blog/2026/05/13/googles-ai-assisted-coding-interview-2026-guide/) | Prep-site/Press | 2026-05-13 |
| S17 | [Let's Data Science: Google tests AI fluency in engineering interviews](https://letsdatascience.com/news/google-tests-ai-fluency-in-engineering-interviews-ddacf941) | Press | 2026-10 |
| S18 | [ITPro: Amazon bans AI tools during job interviews](https://www.itpro.com/business/careers-and-training/amazon-bans-ai-tools-during-job-interviews) | Press | 2025-03-14 |
| S19 | [PracHub: AI-Assisted Coding Assessments in 2027](https://prachub.com/resources/ai-assisted-coding-assessments-in-2027-companies-platforms-rules-and-scoring) | Prep-site | 2026-08-27 |
| S20 | [Anthropic: How to collaborate with Claude during our hiring process](https://www.anthropic.com/candidate-ai-guidance) | Official | 2025-07-10 |
| S21 | [Anthropic Engineering: Designing AI-resistant technical evaluations](https://www.anthropic.com/engineering/AI-resistant-technical-evaluations) | Official | 2026-01-21 |
| S22 | [techinterview.org: What Rippling's engineering interviews actually test](https://www.techinterview.org/post/3233476807/rippling-engineering-interview/) | Prep-site (unsourced) | 2026-07-22 |
| S23 | [techinterview.org: Are you allowed to use AI in coding interviews? 2026 rules](https://www.techinterview.org/post/3233475415/ai-coding-interviews-rules-2026/) | Prep-site | 2026-06/07 |
| S24 | [Final Round AI: Companies that allow AI during interviews](https://www.finalroundai.com/blog/companies-that-allow-ai-during-interviews) | Prep-site (sells AI interview tools) | 2026-08-17 |
| S25 | [Scrapbox summary of Coinbase: Interviewing Engineers in the AI Era](https://scrapbox.io/ohbarye/Interviewing_Engineers_in_the_AI_Era:_Lessons_from_a_Year_of_Rebuilding). Original (not fetched): [coinbase.com blog](https://www.coinbase.com/blog/interviewing-engineers-in-the-ai-era-lessons-from-a-year-of-rebuilding) | Official via secondary | 2026 |
| S26 | [Zeli: Coinbase rebuilds engineering interviews for the AI era](https://zeli.app/en/story/49162299) | Aggregator | 2026-08-03 |
| S27 | [PracHub: Stripe AI coding interview](https://prachub.com/resources/stripe-ai-coding-interview-how-the-round-works-and-how-to-prepare) | Prep-site/Anecdotal | 2026-11-02 |
| S28 | [PracHub: Atlassian AI-assisted coding interview guide 2026](https://prachub.com/resources/atlassian-ai-assisted-coding-interview-guide-2026-repository-tasks-agent-use-and-values) | Prep-site/Anecdotal | 2026-08-26 |
| S29 | [CoderPad Docs: AI Fluency](https://coderpad.io/resources/docs/ai-fluency/) | Vendor | 2026 |
| S30 | [CoderPad: 2026 product recap](https://coderpad.io/blog/product-updates/2026-product-recap/) | Vendor | 2026 |
| S31 | [CoderPad: 5 skills of the future developer, an AI-fluency framework](https://coderpad.io/blog/interviewing/5-skills-of-the-future-developer-a-framework-for-evaluating-ai-fluency/) | Vendor | 2026-04-02 |
| S32 | [CoderPad: State of Tech Hiring 2026 (report)](https://coderpad.io/survey-reports/coderpad-state-of-tech-hiring-2026/) | Vendor survey | 2026-03 |
| S33 | [CoderPad blog: The 2026 State of Tech Hiring](https://coderpad.io/blog/hiring-developers/new-research-the-2026-state-of-tech-hiring-what-ai-means-for-developers-and-hiring-teams/) | Vendor | 2026-03-11 |
| S34 | [CoderPad Careers: How CoderPad will use AI in interviews](https://coderpad.io/careers/using-ai-in-interviews/) | Official (CoderPad as employer) | 2026 |
| S35 | [HackerRank KB: AI-Assisted Interviews](https://hackerrank-knowledge-base.help.usepylon.com/articles/5821380141) | Vendor | 2026 |
| S36 | [HackerRank KB: AI Assistant in Interviews](https://hackerrank-knowledge-base.help.usepylon.com/articles/4698145256) | Vendor | 2026 |
| S37 | [HackerRank KB: AI Fluency Evaluation](https://hackerrank-knowledge-base.help.usepylon.com/articles/1773201418) | Vendor | 2026 |
| S38 | [HackerRank blog: AI fluency isn't a soft skill, here's how to measure it](https://www.hackerrank.com/blog/ai-fluency-isnt-a-soft-skill-heres-how-to-actually-measure-it/) | Vendor | 2026-06-10 |
| S39 | [CodeSignal: Introducing AI-assisted coding assessments and interviews](https://codesignal.com/blog/introducing-ai-assisted-coding-assessments-interviews/) | Vendor | 2025-05-30 |
| S40 | [HRTech Edge: CodeSignal launches agentic AI coding assessments](https://hrtechedge.com/codesignal-launches-agentic-ai-coding-assessments/) | Press release | 2026-04-06 |
| S41 | [Interview Query: CodeSignal's agentic assessments](https://www.interviewquery.com/p/codesignal-ai-assisted-technical-interviews) | Prep-site/Press | 2026-04-13 |
| S42 | [Karat: Karat launches NextGen interviews](https://karat.com/karat-launches-nextgen-interviews-the-first-human-led-ai-enabled-talent-evaluation-solution/) | Vendor | 2025-12-10 |
| S43 | [Karat: NextGen interview candidate prep guide and FAQ](https://customer-operations.zendesk.com/hc/en-us/articles/40486716461079-Karat-NextGen-Interview-Candidate-Prep-Guide-FAQ) | Vendor | 2026 |
| S44 | [Karat: Human + AI technical interview rubrics (PDF)](https://karat.com/wp-content/uploads/2026/02/Human-AI-technical-interview-rubrics.pdf) | Vendor | ~2026-02 |
| S45 | [Codility Support: Meet our AI coding assistant Cody](https://support.codility.com/hc/en-us/articles/20990112657687-Meet-Our-AI-Coding-Assistant-Cody) | Vendor | n.d. |
| S46 | [Codility: How AI fits into technical assessment](https://www.codility.com/ai-technical-assessment/) | Vendor | 2026 |
| S47 | [Formation: What AI-assisted coding interviews actually score](https://formation.dev/blog/ai-assisted-coding-interviews) | Prep-site | 2026-08-26 |
| S48 | [DEV Community (Vinit Shahdeo): AI coding interviews in 2026](https://dev.to/vinitshahdeo/ai-coding-interviews-in-2026-what-no-one-tells-you-before-you-walk-in-174d) | Anecdotal (practitioner blog) | 2026 |
