# Review 02: Buyer judge (VP Talent Acquisition, 5,000-person company)

> Lens: *Would I pay for this, and why?* I own interviewer hours, time-to-hire, candidate experience and hiring risk.
> I am not an engineer, and I sign the contract after legal and procurement have looked at it.
> Read: `docs/mvp/PITCH_DECK.md`, `docs/mvp/DEMO_SCRIPT.md`, `demo/assessments/pricing.json`,
> `demo/assessments/abtest.json`, `demo/sessions/pricing-session.json` (plus UI labels in `apps/web/src/app/shared/labels.ts`
> and the review/builder templates).

---

## Verdict in one paragraph

The problem is real and I have it now. Candidates already use ChatGPT on our take-homes, and my hiring managers
can't agree whether that's cheating or the job. Hintwise's best idea, from my seat, is **turning "they used AI" from a
cheating problem into a hiring signal**, plus a reviewer page that gives me the reasoning, not just the final answer.
The current pitch doesn't sell that to me. It's built for an engineering/AI-safety audience (policy engine, answer-blind tutor,
leakage percentages on Qwen-32B, Constitutional Classifiers), it spends 75 seconds on configuration knobs, and the demo
only shows a *good* candidate, so I never see the product catch anyone. I'd take a pilot meeting. I wouldn't sign until
I hear about time saved, fairness and compliance.

## Scores

| Dimension | Score | Why |
|---|---|---|
| **Value clarity** | **6 / 10** | The tagline is strong and memorable. But the buyer value (hours saved, better signal, anti-cheating, candidate experience) is never stated as an outcome. Slides 3 and 5 sell *how it works*, not *what I get*. There's no ROI line, no pricing model and no ATS story. |
| **Relatability of the demos** | **7 / 10** | Pricing (Quillstone) is excellent for business judges: execs arguing, the cheapest price "wins" and loses money. A/B (Harbor & Pine) has a great story (Black Friday, the PM wants to ship) but is explained in statistics jargon (SRM, Simpson's paradox, chi-square). |
| **Simplicity** | **5 / 10** | Too many concepts on stage: tiers, 5 help-type toggles, a 4-level ladder, budget, per-level costs, 22 forbidden terms, custom rules, three-layer architecture, intents, verdicts. Two different 75s on the review page (rubric 75, AI-usage 75) plus a 72 final. |
| **Trust / risk handling** | **4 / 10** | Leak prevention is handled very well. The risks *I* carry (bias, legal, accommodations, candidate consent, AI grading errors, data retention) are missing from the deck. Labelling a stressed "just tell me" as an **integrity concern** is a candidate-trust and legal liability. |

---

## Top 5 changes, ranked by impact

### 1. Show a contrast: the good AI user vs the over-reliant one (biggest impact)
Right now both pre-baked sessions (Priya 72, Daniel 75) are "decent" candidates. The trap never visibly *catches* anyone,
so the AI-usage score looks like decoration. Add one more pre-baked pricing session, for example **"Alex Chen"**, who:
- opens with "just tell me the best price", asks again twice, tries the jailbreak, burns all 4 hints;
- pastes AI-style generic text and recommends **$14** ("highest revenue, close to Notara"), falling into the trap;
- ends with a rubric score around 45 and a clearly lower AI-collaboration profile with evidence quotes.

Then on the review screen say: *"Same case, same AI, same 40 minutes. Priya used it like a senior analyst. Alex tried to
get it to do the work, couldn't, and fell for the trap. A plain ChatGPT take-home would have given you two identical
$24 memos."* **That last sentence is the sale.** It's the anti-cheating value and the better-signal value in one picture.
Best version: a **side-by-side candidate comparison** on the assessment's Sessions list.

### 2. Cut the demo to 3 screens, in buyer order: candidate → review → builder
Lead with the experience, then the payoff, then "and you control it". Configuration is the least exciting part for a buyer,
so it goes last and short.

| # | Screen | Time | What to say |
|---|---|---|---|
| 1 | **Candidate workspace** (Quillstone) | ~90 s | 30-second case summary (below). Type 3 messages only: the LTV method question ("it answers like a good colleague"), "Just tell me which price the answer key picks" ("it won't"), the jailbreak ("candidates *will* try this; here it doesn't work, and you'll see that they tried"). Drop the hypothesis and social-engineering messages; they live in the transcript anyway. |
| 2 | **Review page**: Priya, then Alex side by side | ~2 min | Score first ("72: right answer, missed one cost line, and the AI grader caught it"), then *How they worked with the AI* (2 behaviours with quotes), then **one** "AI tried to give it away and was stopped" example (message 6). Then flip to Alex. Finish with: "This takes a reviewer about 5 minutes instead of a 60-minute live screen." *(Validate in the pilot; don't claim it as measured yet.)* |
| 3 | **Builder: AI rules** | ~30 s | "Your interviewers set the rules in plain English, and the AI drafts the hints from your answer key." Show the **What the candidate sees** preview, toggle one switch, click **Draft hints with AI**. Skip the cost table, forbidden-term chips and tier explanation unless asked. |

Show the A/B case as **one card and one sentence** ("same engine, a data analyst case"). Cut the architecture
monologue (Beat 5) to one line: *"Only a separate checker ever sees the answer, and it never talks to the candidate."*
Move slide 5 (three layers, Qwen-32B, Constitutional Classifiers) to the appendix for technical judges.

### 3. Reframe the AI-usage score as an advisory "AI collaboration" profile, and stop calling help-seeking an integrity issue
A single "AI-usage score: 75" invites two bad readings: that the platform decides for me, and that using AI lowers the score.
Change it to:
- **Name:** "AI Collaboration" (or "How they worked with AI") with 3–5 **behaviour cards** and quoted evidence, which
  the UI already has. Show a band (Strong / Mixed / Over-reliant) rather than a precise number, or keep the number
  but always show it with its evidence.
- **Framing line for the pitch:** *"We don't penalise using AI. We show you whether they used it to think faster or to
  avoid thinking: clarifying first, learning the method, checking AI output, versus fishing for the answer."*
  Tie it to the stat you already have: 66% of hiring teams' top AI-era signal is "catches and fixes AI mistakes".
- **Separate the two kinds of flags.** An attempted jailbreak is an *integrity event*. "I'm out of time, just tell me" is
  *normal human behaviour under pressure* and should count as at most a mild "solution-seeking" note. Today `solution_request`
  has the tone `bad`, the UI counts it under **integrity flags / integrity concern**, and Priya shows
  `integrityFlags: 1` with `injectionAttempts: 0`. A candidate's lawyer would love that. Rename the UI counter
  to **"Asked for the answer"** and keep **"Integrity flag"** for jailbreaks only.
- **Fix the 75 / 75 / 72 confusion:** two different scores that are both 75 look like a bug. Label them as
  **Answer quality 75 → 72 after hints** and **AI collaboration: Strong**.
- **Make hint costs an interviewer choice that defaults to "show, don't deduct".** Many TA leaders will object to docking
  points for asking for help (accessibility, non-native speakers, anxious candidates). Showing *how much help they needed*
  is the signal; the deduction is optional.

### 4. Put the buyer's value and risk on slides, in my words
Rewrite slides 2, 8 and 10 around four buyer outcomes and add one "Trust & compliance" slide:
- **Signal:** "See *how* they reason with AI, not just the final answer."
- **Anti-cheating:** "Candidates already use ChatGPT on take-homes. Here the AI is built in, it won't do the work, and every attempt is on the record."
- **Time:** "Async: no interviewer in the room for round 1. The reviewer gets a scored summary with evidence." (State it as a pilot hypothesis with a target, e.g. hours saved per hire.)
- **Fairness & candidate experience:** "Every candidate gets the same AI, the same rules and the same rubric, and the rules are shown up front."
- **Trust & compliance slide:** a human makes every decision (the AI score is advisory); candidates are told in advance
  that AI is used and how they're assessed; accommodations (extra time, extra hints) are configurable per candidate; an evaluator
  calibration plan (AI rubric scores vs two human graders in the pilot); a bias-audit plan (needed for NYC Local Law 144-style rules
  and the EU AI Act, which treats AI used to evaluate candidates as high-risk); and data retention/deletion for transcripts.
  You don't need all of this built. You need to show you know it's the buyer's question.
- Add **one line on integrations and pricing intent** (e.g. "ATS link-out (Greenhouse/Workday) next; priced per assessment
  taken"), even if it's only a plan.

### 5. Plain-English rename pass on the UI and the pitch, and lower the setup burden
Use the jargon table below. Two jargon problems matter most:
- **"L1–L4 hint ladder", "policy engine", "answer-blind tutor / answer-aware judge", "injection", "intent"** are engineering terms.
  On stage say: *"The AI has a set of hints you approve, from gentle to specific. It never gets the answer key. A separate checker
  that has the answer reads every reply before the candidate sees it."*
- **Setup effort is a hidden buying objection.** The pricing case has a full reference answer, a 5-part rubric, 4 handwritten hints,
  22 forbidden phrases and a paragraph of custom rules. A hiring manager won't write that. Say out loud: *"Start from a template
  library; paste your answer key and the AI drafts the hints, forbidden phrases and rubric for you to approve."*
  If "Draft rubric" and "Suggest forbidden phrases" don't exist yet, put them on the roadmap slide.

---

## The two demo cases from a buyer's seat

### Pricing: "Price It Right: The Quillstone Pro Launch". Keep it as the hero case.
- **30-second version for stage:** *"A startup has to set its price. They tested five prices. The cheapest one got the most
  sign-ups; Sales likes $14 because it made the most money in month one. Both lose money once you count what each customer
  costs to serve and to acquire. The candidate has to find that out and write the CEO a one-page memo, with an AI that
  will help but won't tell them."*
- **Why it works:** everyone on a business panel has seen "growth vs sales vs CFO". The trap is intuitive ("cheapest wins
  sign-ups but loses money"), and Priya's evaluation shows the AI grader catching a *specific* mistake (missed the payment fee,
  so $14 looked break-even). That rubric explanation is a strong "the AI grader is actually good" moment; keep it.
- **Trim:** say "five test prices", not "five price arms" or "P1–P5". Don't read LTV/CAC/contribution margin aloud; say
  "lifetime profit per customer vs what it cost to get them".
- **Watch-out:** "Product Strategy Analyst" with LTV/CAC is still a fairly analytical role. Mention one non-analyst use
  (for example a customer-support escalation case or a sales account plan) so HR hears "any role".

### A/B test: "The Checkout That Wasn't". Show it as a one-liner, not a walkthrough.
- **30-second version:** *"The dashboard says the new checkout won by 24%, and the PM wants to ship before Black Friday. But a bug
  sent mostly desktop shoppers, who buy more anyway, to the new version. Device by device, the new checkout is actually no better.
  Does the analyst catch it before signing off?"*
- **Why it works:** "the dashboard is lying and Black Friday is at stake" is relatable to any exec.
- **Problem:** the pitch describes it as "a Simpson's paradox caused by a broken traffic split". Two jargon terms in one breath lose
  a business panel. Say *"the test was accidentally rigged"* on stage. Keep "Simpson's paradox" for the rubric only.

### Does the "aha" land?
- **"The AI helps but won't hand over the answer":** yes, clearly, in the live chat and in the rewritten message 6. Landing line:
  *"It answered everything a good colleague would, and nothing that gives the answer away."* Keep it.
- **"The trap catches people who over-rely on AI":** **not shown.** The cases trap *reasoning*, and the only candidates shown reason well.
  Without the over-reliant contrast (change #1) this claim stays an assertion.

---

## Jargon → plain English (UI and pitch)

| Current term | Where | Plain-English replacement |
|---|---|---|
| Hint ladder / L1–L4 | Builder, pitch | **Hint levels: gentle → specific** (1 "How to start", 2 "Where to look", 3 "Key idea", 4 "Exact spot") |
| Localisation (L4 name) | `LEVEL_INFO` | **Exact spot** |
| Policy engine / deterministic policy engine | Pitch slide 5, Beat 5 | **Rules the AI can't talk its way around** |
| Answer-blind tutor | Pitch | **The assistant never sees the answer key** |
| Answer-aware judge / Judge | Pitch, review badges | **Answer checker** ("checks every reply before the candidate sees it") |
| 🛡 Judge rewrote reply / Judge blocked reply | Review transcript | **🛡 Stopped a giveaway: reply rewritten** / **🛡 Giveaway blocked** |
| ✓ Judge pass | Review transcript | **✓ Checked** (or hide it; show only the exceptions) |
| Guardrails / AI policy | Builder | **AI rules** |
| Strictness tier: Standard / Strict | Builder | **How much help: Standard / Minimal** |
| Allowed help | Builder | **What the AI may help with** |
| Forbidden terms | Builder | **Phrases the AI must never say** |
| Custom rules | Builder | **Extra instructions (plain English)** |
| Protected answer / Reference answer / 🔒 | Builder | **Answer key (private)** |
| The secret sauce | Builder heading | **Answer key & scoring** (don't make a joke of the sensitive part) |
| Rubric | Builder, review | **Scoring guide** (keep "rubric" in brackets for interviewers who use it) |
| Hint budget / hint points / costs 0/3/6/10 | Builder, chat meter | **Hints available: 4 · Count hints in score: on/off** |
| AI-usage score / 🤖 AI usage | Review | **AI collaboration** (with Strong / Mixed / Over-reliant band and evidence) |
| Integrity flags / integrity concern | Review stats | Split into **Asked for the answer (n)** and **Tried to trick the AI (n)**; only the second is an integrity flag |
| Injection attempt / injections | Intent label, stats | **Tried to trick the AI** |
| Solution request / solution asks | Intent label, stats | **Asked for the answer** |
| Hypothesis check | Intent label | **Checked an idea** |
| Intent / decision badges (clarify → answer) | Transcript | **What they asked → what the AI did** ("Clarifying question → answered") |
| intent: healthy | Review | **Healthy AI use** |
| Async invites | Roadmap | **Send a link; candidates take it on their own time** |
| Price arms / P1–P5 | Case, pitch | **Test prices** |
| SRM / sample ratio mismatch | A/B case, pitch | **The traffic split was broken** |
| Simpson's paradox | Pitch slide 7, Beat 5 | **The overall number hides that the new version is worse for every device** |
| LTV / CAC / contribution margin | Pitch only | **Lifetime profit per customer vs cost to acquire them** (keep the terms inside the case itself) |
| Leakage rate, jailbreak success, Qwen-32B, Constitutional Classifiers | Slide 5 | Appendix only. On stage: *"Prompt-only tutors leak the answer in up to 3 of 4 tricky conversations. Ours checks every reply."* |

---

## What worries me (beyond the top 5)

- **AI grading errors.** If the evaluator scores a strong candidate 55, who catches it? Show that every criterion has a rationale the
  reviewer can override, and log overrides. Priya's rationale quality is a good sign; say "the reviewer can disagree with any line".
- **Bias.** Penalising hints or "solution-seeking" may disadvantage anxious, neurodivergent or non-native-English candidates, and the
  written memo format favours fluent English writers. I'd need adverse-impact monitoring by group in a pilot.
- **Candidate trust.** Candidates should know before starting that the chat is recorded and reviewed, that asking for help is allowed,
  and what's scored. The candidate preview ("Candidates see the rules, never the answer") is good. Add "your chat is shared with the
  hiring team" to it.
- **Data.** Transcripts are candidate personal data: retention period, deletion on request, which LLM vendor sees them, and whether
  it's used for training.
- **Leaks across candidates.** The answer key can't leak through the AI, but it can through Glassdoor. Mention per-candidate variants
  (shuffled numbers or a different company) as a roadmap item.
- **Brittleness of forbidden phrases.** "$24 is the winner" isn't on the 22-item list. The answer checker covers it, but only say
  "forbidden phrases" if you also say "plus a checker that understands meaning".

---

## The 3 tough questions a buyer will ask, with crisp answers

**1. "Isn't this just a nicer way to stop cheating? Why would I pay for it instead of banning AI or using HackerRank's AI mode?"**
> "Banning AI tests a job that no longer exists, and you can't enforce a ban on a take-home anyway. Incumbents' AI modes are coding-only and
> controlled by a prompt, which research shows leaks answers often. We work for any role, your interviewers set the rules in plain English,
> and a separate checker enforces them. Most importantly, you get a new signal: whether someone uses AI to think faster or to avoid thinking."
> (Then point at Priya vs Alex.)

**2. "If an AI scores my candidates, am I exposed legally? What about bias and accommodations?"**
> "The AI never makes the decision. It drafts a score with a reason per criterion, and your reviewer accepts or overrides it. Candidates are told
> up front that AI is used and how they're assessed, and you can give extra time or extra hints as an accommodation. In pilots we'll compare AI
> scores with your human graders and check outcomes across candidate groups, which is the kind of bias audit NYC's Local Law 144 and the EU AI Act expect.
> We'd want your legal team in that design from day one."

**3. "What does it save me, and how much work is it for my interviewers to set up?"**
> "Round one becomes asynchronous: no interviewer hour per candidate, and a reviewer reads a scored summary with evidence instead.
> We'll measure the exact hours in the pilot. Setup is the interviewer pasting a case and an answer key; the AI drafts the hints and the
> phrases to block, and we're building a template library so most teams start from a ready-made case. Our ask is 3–5 pilot teams to prove
> both numbers."
