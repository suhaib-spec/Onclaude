# Review 01 — Investor Judge (VC lens)

> Reviewer persona: early-stage VC partner on a business-oriented pitch panel, ~500 pitches heard.
> Material reviewed: [`docs/mvp/PITCH_DECK.md`](../mvp/PITCH_DECK.md), [`docs/mvp/DEMO_SCRIPT.md`](../mvp/DEMO_SCRIPT.md),
> [`docs/mvp/MVP_SPEC.md`](../mvp/MVP_SPEC.md) (skimmed), [`docs/research/01-interview-formats.md`](../research/01-interview-formats.md) §1.
> Date: 2026-11-16. Pitch is in ~2 hours, so everything below is ordered for **what you can change today**.

---

## 0. Verdict in one paragraph

The product is real and the demo is strong. The jailbreak that gets neutralised, plus the 🛡 "rewritten" badge in
the transcript, is the moment judges will remember. **The deck, though, is a research talk, not a pitch.** It spends
3 of 10 slides proving that the gate works (slides 3, 5, half of 8). It spends **zero** slides on who pays, how much,
or how big this gets. There is no market number, no pricing, no wedge, and the ask is "mentors and feedback." A VC
will believe the technology at minute 3 and stop listening at minute 8, because nothing tells them this is a business.
Fixing that takes about 2 slides and 4 sentences.

---

## 1. Scores

| Dimension | Score | Why |
|---|---|---|
| **Clarity** | **6 / 10** | "AI that helps you think, not copy" is sticky, but it sounds like a **student tutor**, not a hiring product. Slide 1 calls it a "practice *and* assessment platform", and slide 8 then lists **three** customers (hiring teams, candidates, universities). A VC hears "we don't know who our customer is." The 10-second version is not on any slide. |
| **Urgency / Why now** | **7 / 10** | The 46% stat plus Canva, Meta and Google is a good "why now." But slide 2 frames the pain from the **candidate's** side ("nobody has practised"), and candidates are not the buyer. The employer pain (*"I can't tell who can actually work with AI, and I'm hiring for an AI-first job with a 2019 interview"*) is only implied. |
| **Market** | **3 / 10** | No TAM, no SAM, no comparable valuations anywhere in the deck. "Incumbents are adding guarded AI, which validates the need" is the only market argument, and it doubles as the best argument **against** you. |
| **Business model** | **2 / 10** | Absent. No pricing, no unit of sale (per seat? per assessment? per candidate?), no first customer profile, no sales motion. |
| **Defensibility** | **4 / 10** | The three-layer gate is good engineering, but a VC will think *"HackerRank can build that in a quarter."* The real moat candidates are not pitched: (a) the **AI-usage behaviour dataset**, tied to hiring outcomes; (b) a **library of non-coding AI-era assessments with built-in traps**; (c) a **leak-rate benchmark** you publish and others are measured against. |
| **Memorability** | **7 / 10** | Name is good (short, says "hints"). The jailbreak demo is a great set piece. The Quillstone trap ("the best-converting price loses money") is a nice story. Three layers, a 4-level ladder, 10 intents and six stats on one slide all blur together. |

**Overall: ~5 / 10 as a business pitch; ~8 / 10 as a product demo.** That gap is the whole opportunity.

### What makes me lean in
- The live jailbreak attempt fails on stage. Do it **with a judge typing**, not you.
- **Any role, not just coding.** This is the actual wedge, and it is buried on slide 7. HackerRank, CodeSignal and Codility
  are coding-only (R1 §1). Nobody owns *"AI-allowed case interviews for analysts, PMs, consultants and finance."*
- An evidence-linked "how they used AI" report. Hiring teams' top signal when AI is allowed is "catches and fixes AI
  mistakes" (66%) (R1 §2.1, CoderPad 2026). You can show that being scored.

### What makes me tune out
- Slide 3 has **seven** percentages from education research (CS50, Wharton/PNAS, leakage study). A business panel
  does not care that a Harvard tutor leaked code. Keep one stat, at most.
- Slide 5's architecture (answer-blind tutor, deterministic policy engine, answer-aware judge, Qwen-32B, Constitutional
  Classifiers) is great for a technical judge and fatal for a VC. Collapse it to one sentence and one picture.
- Three customer segments with no prioritisation.
- An ask for "mentors" and "feedback." That's what teams say when they don't think they're a company.

---

## 2. Top 5 changes, ranked by impact

### #1 — Pick one buyer and say it in 10 seconds (Slides 1 + 2) — *highest impact, 15 minutes*

**Buyer: hiring teams (employers).** Candidates are the free top of the funnel. Universities and bootcamps are a later
channel. Say that out loud.

**10-second one-liner (put it on slide 1, say it first):**
> "Hintwise lets hiring teams run AI-allowed interviews for **any role**, with an AI assistant that **can't leak the
> answer**, and shows exactly **how well each candidate used AI**."

**Tagline options** (keep "AI that helps you think, not copy" as the subtitle; it's good, just student-flavoured):
1. **"Interview the way they'll actually work: with AI, on your rules."** (my pick: employer-framed, says the "why")
2. "Let candidates use AI. Don't let AI take the interview."
3. "Hire people who think *with* AI, not people who copy *from* it."
4. "The AI interview, with the interviewer in control."

**Sharper problem statement (slide 2 headline + one line):**
> **"Every company is hiring for AI-first jobs with pre-AI interviews."**
> Ban AI, and you test a job that no longer exists. Allow ChatGPT, and you test who can paste. Either way, you learn
> nothing about the one skill you're hiring for: **thinking with AI without outsourcing your judgement.**

Then exactly two proof bullets: the 46% adoption stat and Gartner's candidate-fraud stat (see #2). Move "candidates
have never practised this" to the candidate-funnel line on the business-model slide.

---

### #2 — Put 3 numbers on the slides, with sources (replace most of slide 3)

| # | Number | Use it to prove | Source |
|---|---|---|---|
| 1 | **46%** of hiring teams allow AI in technical interviews in some form, and another **20%** decide case by case. Only 34% still ban it. | *Why now*: the format already flipped | CoderPad, *State of Tech Hiring 2026* (650+ respondents, Mar 2026), via R1 §2.1 [S32] |
| 2 | **$1.34B** global pre-employment assessment tools market in 2025, growing to **$3.01B by 2034** (9.4% CAGR) | *Market*: an existing budget line you take share of; you don't create a new one | [The Insight Partners, Pre-Employment Assessment Tools Market](https://www.theinsightpartners.com/reports/pre-employment-assessment-tools-market) |
| 3 | **39%** of candidates already use AI during the application process, and Gartner predicts **1 in 4** candidate profiles worldwide will be fake by 2028 | *Urgency for the buyer*: trust in the hiring signal is collapsing | [Gartner press release, 31 Jul 2025](https://www.gartner.com/en/newsroom/press-releases/2025-07-31-gartner-survey-shows-just-26-percent-of-job-applicants-trust-ai-will-fairly-evaluate-them) (surveys of 3,290 and 2,918 candidates) |

**Category proof** (one line on the market slide, said aloud): technical interviewing alone has produced a unicorn.
[Karat raised $110M at a $1.1B valuation (TechCrunch, Oct 2021)](https://techcrunch.com/2021/10/13/karat-raises-110m-on-a-1-1b-valuation-to-grow-its-technical-interviewing-as-a-service-platform),
and [CodeSignal raised a $50M Series C led by Index Ventures in 2021](https://en.wikipedia.org/wiki/CodeSignal).
*Those are 2021-vintage figures, so say "proved the category," not "current valuations."*

**Caveats to know before a judge asks:** analyst-firm market sizes vary widely by definition (software only vs. all
assessment services), so call $1.34B "the narrow software-only figure" (it's conservative, which is good). The CoderPad
survey is a vendor survey; say "CoderPad's 2026 survey of 650+ hiring teams."

**Keep exactly one technical stat** (for the "why can't they just prompt ChatGPT" question): *"Harvard's CS50 AI tutor
was told not to give code, and ~half its conversations still contained code"* (R2 §2.1). Cut the rest of slide 3, or
move it to the appendix.

---

### #3 — Add a business-model slide (new slide, replaces the roadmap's spot or sits before it)

**Slide title:** *"Employers pay. Candidates come free."*

**Wedge:** AI-allowed **case assessments for non-engineering roles**: data/business analysts, PMs, consulting, finance,
ops. Coding incumbents don't serve these roles, the roles are high-volume, and AI is already central to the work.
Coding comes second (roadmap), where you meet incumbents with an already-proven gate.

**Pricing tiers (illustrative, so label them "pilot pricing"):**

| Tier | Price | For | Includes |
|---|---|---|---|
| **Practice** | Free | Candidates | Public practice cases, gated AI, a personal "AI-usage" report. *This is the acquisition funnel and data engine, not a revenue line.* |
| **Team** | **$300 / month**, 50 candidate sessions | Startups and single hiring managers | Builder, guardrails, invite links, AI evaluation and AI-usage report, content library |
| **Growth** | **$1,200 / month**, 300 sessions | Mid-size hiring teams | Everything in Team, plus ATS integration (Greenhouse/Lever), team rubrics, cohort benchmarks |
| **Enterprise** | Custom (**$25k–$100k ACV**) | Large employers, staffing firms | SSO, live-interview mode, custom content, leak red-team reports, bias-audit support, API/OEM |
| **Education** (channel) | ~$10 / student / course | Universities, bootcamps | Guarded AI for coursework; feeds candidates into the free tier |

**Unit-economics line (say it, don't slide it):** a session is roughly 20–40 LLM calls, which costs **cents to about a
dollar**. At ~$4–6 per session, gross margin is SaaS-like. *(This is an estimate; measure it from your real API logs
before you quote it.)*

**Expansion story:** start in one team's analyst hiring → expand to every role → own the "AI-fluency score" that sits on
every candidate profile.

---

### #4 — Reframe defensibility: the moat is the data, not the gate (rewrite slide 8's last bullet + add one line to slide 5)

Right now you hand the judge the objection: "Incumbents are adding guarded AI modes." Replace it with:

> **"Anyone can build a guarded chatbot. Nobody has the data on how good candidates use AI."**
> 1. **AI-usage dataset:** every session produces labelled behaviour (clarify, hypothesis, hint level, jailbreak attempt,
>    verification). Link that to hiring outcomes and you own the only *validated* AI-fluency signal.
> 2. **Content library:** AI-era assessments with built-in traps (Simpson's paradox, the profitable-price trap) across
>    every role. Each one costs real expertise to write, and they compound.
> 3. **Leak benchmark:** you publish a leak rate per assessment and per model. *"Our gate leaks under X% under
>    adversarial attack"* becomes the trust standard buyers ask competitors to match.

And collapse slide 5 to **one sentence + one diagram**: *"The AI talking to the candidate never sees the answer. The
only part that knows the answer never talks to the candidate."* That line is your entire technical moat in plain
English. Put the three-layer detail in an appendix slide for technical judges.

---

### #5 — Replace the ask with a specific, measurable one, and end on the jailbreak (slide 10)

Current ask: "pilot partners, feedback, mentors." It's too soft. Replace with:

> **"We're signing 3 design partners in the next 30 days: hiring managers for analyst, PM or ops roles. You run one real
> AI-allowed assessment for free; we deliver a report on how every candidate used AI. If you hire, give us one open
> role."**
> **And a dare:** "The candidate link is on this slide. If you can get Hintwise to give you the answer before we finish
> Q&A, we'll buy you dinner."

The dare is your memorability multiplier: judges will literally try to break it during Q&A, which turns the product into
the conversation. *(Only do this if the live gate has been rehearsed against a dozen jailbreaks today. If unsure, run the
dare on the pre-baked invite with mock mode as the fallback.)*

**Closing line:** *"Every company is about to interview with AI. Hintwise makes sure they're measuring the candidate, not
the chatbot."*

---

## 3. Suggested 10-slide order (minimal edits)

1. Title + 10-second one-liner (#1)
2. Problem: "AI-first jobs, pre-AI interviews" + 46% + Gartner (#1, #2)
3. Solution: build → solve → review (current slide 4, unchanged)
4. **Demo** (current slide 6). Move the demo *earlier*; it's your best asset.
5. How the gate works: **one sentence + one diagram** (#4); detail goes to the appendix
6. Any role: the wedge (current slide 7, retitled *"Our wedge: the 80% of roles coding platforms ignore"*; say it as
   a claim, not a statistic, unless you source it)
7. **Market** ($1.34B → $3.01B; Karat/CodeSignal as category proof) (#2)
8. **Business model** (tiers above) (#3)
9. Moat + competition: "they're coding-only and prompt-configured; we're the policy layer for every role, plus the data" (#4)
10. Ask + dare + closing line (#5). Roadmap folds into one line on slide 9 or the appendix.

---

## 4. The 3 tough questions judges will ask (with crisp answers)

### Q1. "HackerRank already ships a guarded AI mode and auto-grades 'AI fluency.' Why don't they crush you?"
> "They're coding-only, and their guardrails are a prompt. We start where they don't play: analyst, PM, consulting
> and finance case interviews, which are high volume and have no AI-assisted tool at all. And our guardrail is
> architectural: the model talking to the candidate never sees the answer. Prompts alone leak; Harvard's CS50 tutor
> still produced code in about half its conversations. If an incumbent wants a gate for non-coding roles, we'd rather
> be the engine they license than the feature they copy."

### Q2. "Who pays, how much, and who is customer number one?"
> "Hiring teams pay per month, by candidate-session volume: $300 for a single team, $1,200 for growth teams, enterprise
> custom. Candidates practise free; that's our funnel and our data. Customer one is a hiring manager for analyst or PM
> roles at a 50–500 person company: they already run take-home cases, they already know candidates use ChatGPT on them,
> and they can buy without procurement. Our goal this month is three design partners."

*(If you have even one warm conversation with a real hiring manager, name the company type and role here. One real
signal beats every stat on the deck.)*

### Q3. "You're scoring candidates with AI. How do you know the AI-usage score is valid, and isn't that a legal risk?"
> "It's decision support, not a decision. Every score links to the exact transcript lines that produced it, and the
> human interviewer makes the call. Leading companies like Meta and Canva explicitly don't penalise *how often*
> candidates use AI, so neither do we as a raw count. We score behaviours hiring teams say they value, like clarifying
> first and catching AI mistakes. Validity comes from the pilots: we'll compare the score against interviewer
> judgement and hiring outcomes. For regulated buyers, bias audits are on the enterprise roadmap."

**Heads-up, internal:** the MVP's `aiUsageScore` heuristic (MVP_SPEC §5) *does* subtract for heavy hint use, while
R1 §1 notes that Meta, Karat and Canva don't score usage frequency. Be ready to say "we penalise *solution-seeking*,
not *asking for help*," and make sure the demo narration matches. Also note that automated hiring tools face audit
rules in some jurisdictions (e.g. NYC's Local Law 144 bias-audit requirement for automated employment decision tools;
the EU AI Act treats employment AI as high-risk). Don't raise this yourself, but don't be surprised by it.

### Bonus Q (likely): "What stops the candidate from opening ChatGPT on their phone?"
> "Nothing, and that's the point: we're not a proctoring company. When the AI in the room is genuinely useful and
> answers concept and method questions directly, there's less reason to leave it. And what we grade is the reasoning in
> the memo plus how they worked with the AI, which a pasted answer can't fake. Proctoring integrations are a partner
> play, not our core."

---

## 5. Sources consulted

- CoderPad, *State of Tech Hiring 2026*, via [`docs/research/01-interview-formats.md`](../research/01-interview-formats.md) §2.1 [S32]: 46% / 20% / 34% policy split; 66% "catches and fixes AI mistakes".
- [The Insight Partners — Pre-Employment Assessment Tools Market](https://www.theinsightpartners.com/reports/pre-employment-assessment-tools-market): US$1.34B (2025) → US$3.01B (2034), 9.38% CAGR.
- [Gartner press release, 2025-07-31](https://www.gartner.com/en/newsroom/press-releases/2025-07-31-gartner-survey-shows-just-26-percent-of-job-applicants-trust-ai-will-fairly-evaluate-them): 39% of candidates used AI while applying (Q4 2024, n=3,290); 1 in 4 candidate profiles fake by 2028; 26% trust AI to evaluate them fairly (Q1 2025, n=2,918).
- [TechCrunch, 2021-10-13 — Karat raises $110M at $1.1B valuation](https://techcrunch.com/2021/10/13/karat-raises-110m-on-a-1-1b-valuation-to-grow-its-technical-interviewing-as-a-service-platform).
- [Wikipedia — CodeSignal](https://en.wikipedia.org/wiki/CodeSignal): $25M Series B (2020, Menlo), $50M Series C (2021, Index).
- Pricing tiers and per-session cost are **reviewer estimates**, not sourced; validate before quoting as fact.
