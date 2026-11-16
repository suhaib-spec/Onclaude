# Hintwise — Pitch Deck Content (10 slides)

> Content for the judges' deck (T-018). Every statistic comes from the project's research reports; the report and
> its source are named under each slide. **R1** = [`docs/research/01-interview-formats.md`](../research/01-interview-formats.md),
> **R2** = [`docs/research/02-gated-ai-design.md`](../research/02-gated-ai-design.md).
> Demo flow: [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md).

---

## Slide 1 — Title
**Hintwise: AI that helps you think, not copy.**
- The practice and assessment platform for AI-assisted interviews.
- Interviewers set the guardrails. Candidates solve real problems with a gated AI.
- Any role: business, data, math, and coding.

**Speaker notes:** "Every hiring team is asking the same question: if candidates will use AI on the job, how do
we interview them with AI, fairly? Hintwise is our answer. It's an AI that helps you think, not copy."

---

## Slide 2 — The problem
**AI-assisted interviews are the new normal, and nobody is ready for them.**
- 46% of hiring teams now allow AI in technical interviews in some form; another 20% decide case by case (R1 §2.1, CoderPad *State of Tech Hiring 2026*).
- Canva *expects* candidates to use AI; Meta runs an AI-enabled coding round; Google is piloting one (R1 §1, §3).
- Candidates have never practised this format; their most common failures are behavioural: prompting before understanding, pasting unreviewed AI output (R1 §1).
- Interviewers can't control how much the AI helps: a general chatbot simply hands over the answer.

**Speaker notes:** "The format changed faster than the preparation. Candidates practise LeetCode alone, then walk
into an interview with an AI and either over-rely on it or don't use it at all. And interviewers have one switch:
AI on or AI off."

---

## Slide 3 — Why "just prompt it not to answer" fails
**A prompt is a suggestion, not a guarantee.**
- Harvard's CS50 tutor: despite a long "don't give code" system prompt, ~22% of messages and ~48% of conversations still contained generated code, and a model upgrade made it worse (R2 §2.1, CS50 2025).
- Tutors that held a secret answer leaked it in 40–75% of adversarial dialogues on average; persuasion was the strongest attack, at 74% (R2 §0, §4.1, answer-leakage study 2026).
- Unrestricted AI raised practice scores 48% but cut exam scores 17%; a hint-only tutor raised practice 127% with no exam penalty (R2 §2.6, Wharton / PNAS 2025).

**Speaker notes:** "So the answer isn't 'no AI', and it isn't 'a better prompt'. Guardrails have to be enforced by
the architecture, and they also make the learning stick."

---

## Slide 4 — The solution
**Interviewers design the assessment and the AI's rules. Candidates solve with a gated AI. Reviewers see how they used it.**
- **Builder:** problem statement, materials (CSV, docs), protected reference answer, weighted rubric.
- **Guardrails:** strictness tier, allowed help types, a 4-level hint ladder, hint budget and costs, forbidden terms, custom rules in plain English.
- **Candidate workspace:** brief and materials, a memo editor, and the AI chat with a hint meter.
- **Review:** rubric scores, an AI-usage score with evidence, and an annotated transcript.

**Speaker notes:** "Three users, one loop. The interviewer decides where the line is; the candidate gets a
genuinely useful assistant; the reviewer sees not just the answer but the thinking."

---

## Slide 5 — How the gate works
**Three layers: no single prompt holds the secret.**
1. **Answer-blind tutor:** never receives the reference answer or the forbidden terms, only what the current hint level allows.
2. **Deterministic policy engine:** plain code, not an LLM, classifies each request (clarify, concept, hypothesis check, hint, solution request, injection), decides answer / hint / redirect / decline, and meters hints.
3. **Answer-aware judge:** a forbidden-term and numeric-leak check plus an LLM judge that sees the answer; a leaky draft is rewritten or replaced before the candidate sees it.

- Evidence for the design: a judge + rewriter cut leakage from 46% to 4% and from 70% to 4% on Qwen-32B (R2 §5.1, answer-leakage study); separate input and output classifiers cut jailbreak success from 86% to 4.4% (R2 §5.2, Anthropic Constitutional Classifiers).

**Speaker notes:** "The only component that knows the answer is the judge, and it never talks to the candidate.
The rules live in code, so 'ignore previous instructions' has nothing to override."

---

## Slide 6 — Demo
**Live: a product-strategy case with a built-in trap.**
- Quillstone, a fictional AI notes startup, must price its Pro plan. The best-converting price and the best month-one-revenue price both lose money.
- Watch: clarifying questions answered, a method explained, a hypothesis redirected, hints that cost points, and a jailbreak neutralised.
- Review: a scored memo, the AI-usage profile, and the 🛡 moment where the judge rewrote a leaky draft.

**Speaker notes:** Follow [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) Beats 2–4. Land the line: "It answered everything a
good colleague would, and nothing that gives the answer away."

---

## Slide 7 — Any role, not just coding
**If AI is useful in the job, it belongs in the interview.**
- **Business:** pricing, market sizing, unit economics (demo 1: the Quillstone pricing decision).
- **Data:** experiment analysis and statistics (demo 2: an A/B test where the headline win is a Simpson's paradox caused by a broken traffic split).
- **Math, finance, operations, and coding:** same engine; only the materials and the rubric change.
- Interviewers write rules in plain English; the platform turns them into enforced policy.

**Speaker notes:** "Most AI-interview tools are coding-only. The skill we're testing, reasoning with an AI without
outsourcing your judgement, is universal."

---

## Slide 8 — Users and market
**Two sides, one platform.**
- **Hiring teams:** a fair, controllable AI round; transcripts and evidence-linked scoring instead of gut feel. Hiring teams' top signal when AI is allowed is "catches and fixes AI mistakes" (66%) (R1 §2.1, CoderPad 2026).
- **Candidates:** practise the AI-assisted format with real feedback on how they use AI, not just whether they got the answer.
- **Universities and bootcamps:** guarded AI for coursework and capstones, where unrestricted AI hurts learning (R2 §2.6).
- Incumbents (HackerRank, CodeSignal, Codility) are adding "guarded" AI modes, which validates the need, but these are coding-only and prompt-configured (R1 §1).

**Speaker notes:** "The market is moving: the big assessment platforms are shipping restricted AI modes. We go
further: any role, interviewer-defined guardrails, and enforcement that doesn't rely on a prompt."

---

## Slide 9 — Roadmap
**From MVP to the AI-interview standard.**
- **Now (MVP):** builder + guardrails, gated AI with policy engine and judge, async invites, AI evaluation and usage insights, two demo cases.
- **Next: coding IDE track:** existing-codebase challenges in a browser IDE, sandboxed tests and the same gate (the format Meta and Google use; R1 §1).
- **Then: live interviews:** the interviewer watches the session live and can adjust the guardrails mid-interview.
- **Analytics:** cohort benchmarks, rubric calibration, leak red-team reports per assessment.

**Speaker notes:** "Everything in the MVP is the core loop. The coding track reuses the same gate; live mode and
analytics turn it into a hiring-team product."

---

## Slide 10 — The ask
**Help us put Hintwise in front of real interviewers.**
- **Pilot partners:** 3–5 hiring teams or university courses to run real assessments.
- **Feedback:** what guardrails would *you* want to control?
- **Team:** we're looking for mentors in hiring/HR tech and assessment design.

**Speaker notes:** "If you hire, teach, or interview, try the candidate link yourself. If you can get it to give
you the answer, we want to hear about it. Hintwise: AI that helps you think, not copy."
