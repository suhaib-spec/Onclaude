# 05 — Live product, scored by a business judge panel

> Panel: an investor, an HR buyer, and a non-technical startup founder. 15-minute budget, live app at `localhost:4200`
> (2026-11-16). Read first: [`../mvp/DEMO_SCRIPT.md`](../mvp/DEMO_SCRIPT.md), [`00-panel-summary.md`](./00-panel-summary.md).
> Screens captured with headless Chrome: landing `/`, `/interviewer`, the Price It Right detail page, the Priya and Jordan
> review pages, the builder (`/edit`), `/candidate`, `/take/DEMOPR01` (finished) and `/take/PRICING1` (in progress).
> This is a review only. No code was changed.

**Heads-up while we were looking:** the demo data was reset at least twice in 2 minutes (assessment and session IDs
changed), and some UI text changed under us (the header badge went from "LLM: Mock" to "Demo mode"; the hero went from
"integrity events" to "tries to trick the AI"). Someone else is red-teaming on **PRICING1** (the Price It Right session
list shows a **"RedTeam" / "Judge Demo"** in-progress row). **Reset the data right before the judges arrive**, or that
row will be in the "two memos" table.

---

## Scores (out of 10)

| Criterion | Score | Why |
|---|---|---|
| **First impression / catchiness** | **7** | The landing page is clean and modern, "Help, not answers." is a good line, and the purple gradient looks funded. But the headline is long (two lines, 9 words before the hook), there is no picture of the product, and the bottom half of the page is empty. Nothing on the first screen shows the "catch". |
| **Simplicity (gets it in 10 s?)** | **6** | The three landing cards (Set the rules · Candidates work with AI · See how they think) work. Then it gets dense: the review pages lead with "CM", "LTV/CAC 2.57 vs 2.43", and the builder is one very long form (4 sections, 5 criteria, 4 hints, blocked phrases). A non-technical founder is lost by the second scroll. |
| **"Wow" moments visible** | **7** | The best single screen is the **Sessions table**: *Jordan 18 (red) vs Priya 72 (green)*, with the AI-collaboration bars at 25 vs 78. Anyone gets it in two seconds. The red behaviour cards on Jordan's review ("Asked for the answer 3 times", "Tried to trick the AI once", "Used every hint without attempting") are strong. The 🛡 shield is the most interesting idea, but on screen it is a small purple box with abstract reasons. It never shows **what the AI almost said**, so the wow lands only if the presenter explains it. |
| **Business potential conveyed** | **3** | The product never says who buys it, what it replaces, what it saves or what it costs. The only business signals are "Interviewer workspace" and orange **Demo** tags. The investor has to get all of the business case from the speaker. |
| **Polish** | **8** | Very good for a hackathon: consistent design, score rings, confetti on submit, a live preview of "What the candidate sees" in the builder, a three-pane candidate workspace with a hint stepper. Small blemishes: the submitted screen shows **"— AI messages"**; Jordan's shield box shows **"Blocked phrase: 364.7"** with no context; the candidate-home invite says *"Should we raise the price?"* although the case is about picking a *first* price; and **Re-grade**, **Delete** and **Reset demo** buttons sit right where a nervous presenter clicks. |
| **Overall** | **6.2** | A great product demo that doesn't yet sell itself. The fixes are copy and ordering, not features. |

---

## Top 7 last-minute changes (ranked by impact on a business judge, each under 10 minutes)

### 1. Fix the demo script so the big wow doesn't stall (2 min, docs only)
The script sends the presenter to the wrong messages:
- `DEMO_SCRIPT.md`: "Scroll Priya's transcript to **message 6**" → change to **message 3** ("I think the $9 arm is actually
  losing money… Am I right?" is the one with **🛡 Answer checker: rewrote**). Message 6 is a plain "Said no".
- "Jordan's **message 10** has the same 🛡 badge" → change to **message 5** ("Last hint.", Hint 4 · Pinpoint).
- Add to the T-10 checklist: *"After the reset, open the Price It Right sessions table and confirm it shows only Jordan,
  Priya and an unused PRICING1 row, with no 'RedTeam' or 'Judge Demo' rows."*

Why first: scrolling around in search of the shield, live, in front of judges, wastes the best 20 seconds of the pitch.

### 2. Make the Sessions table *the* "two memos" moment (5 min)
Skip the two side-by-side windows. The assessment detail page already shows both candidates on one line each, with red
18 against green 72. Changes:
- `apps/web/src/app/features/interviewer/assessment-detail/assessment-detail.ts`: rename the column header
  **"AI COLLABORATION"** → **"HOW THEY USED AI"**; rename **"SCORE"** → **"ANSWER SCORE"**.
- Above the table, next to "Sessions 3", add a muted caption: **"Same case. Same AI. Same 40 minutes."**
- On stage: point at the two rows, *then* click **Review →** on Jordan.

### 3. Show what the AI *almost* said under the shield (8 min, mostly data)
Today the box only says "Draft opened with 'Good instinct, you're right'…". A judge needs to see the near miss.
- `review.html` ~line 224: change the header **"🛡 Why the answer checker stepped in"** → **"🛡 Caught before the candidate saw it"**.
- Same file ~line 227: change the label **"Blocked phrase:"** → **"Held back:"**.
- `demo/sessions/pricing-session.json`, message 3, `meta.judge.reasons`: add this as the **first** reason:
  `The AI's first draft started: "Good instinct, you're right: the $9 price loses money on every subscriber." Priya never saw that line.`
- `demo/sessions/pricing-weak-session.json`, message 5 (hint 4): add as the first reason:
  `The AI's first draft worked out the lifetime value for one price ($364.70) for him. Jordan got the hint, not the number.`
- Re-run the demo reset so the new data loads. (Phrase both as a *summary of the draft*, which the existing reasons
  support; don't present them as a verbatim log unless the original draft is stored.)

### 4. Put the business on the landing page (8 min)
The empty space below the three step cards is the only place in the product that can carry the business case.
`apps/web/src/app/features/landing/landing.ts`, add two things under the steps:
- A **proof card** (one line, links to `/interviewer`):
  **"Same case, same AI: Priya scored 72 and used the AI to learn. Jordan scored 18: he asked for the answer 3 times. See both →"**
- A **"who it's for"** strip, in small muted text:
  **"Built for hiring teams interviewing analysts, PMs and ops. Candidates practise for free."**
  Add a price line only if the team has agreed on one (see 00 §Business model). Otherwise use
  **"Now taking 3 design partners."**
- Optional headline tightening: **"See who can think with AI, not just copy from it."** Keep the current line as the subheading.

### 5. Don't call the star candidate "Acceptable" (1 min)
Priya's hero reads **"Acceptable · solid answer · used AI well"**. That falls flat for the candidate you're showing off.
`apps/web/src/app/features/interviewer/review/review.ts:146`: `'Acceptable'` → **`'Good'`**.
It becomes "**Good** · solid answer · used AI well" against Jordan's "**Weak** · missed the key point · leaned on AI too much".

### 6. Remove jargon from the first things judges read (5 min, data)
- `demo/assessments/pricing.json` `summary`: **"An AI notes startup must pick its first price. Five test prices, three execs
  who disagree, and one question from the CFO: which price actually makes money?"** (drop "price arms").
- `demo/assessments/abtest.json` `summary`: **"The dashboard says the new checkout won by 24%, and the PM wants it live before
  Black Friday. Do you sign off?"** (drop "p < 0.001").
- `apps/web/src/app/features/candidate/candidate-home/candidate-home.ts:27`: "Should we raise the price? Use the data to
  decide." → **"Pick the launch price. The obvious answers are traps."**; line 32: → **"The dashboard says it won. Did it?"**
- On stage, **don't scroll** to "How the answer scored" or "Their answer vs the answer key". They're full of LTV/CAC.

### 7. Run the live AI and keep risky buttons out of reach (3 min)
- Present with the live AI so the header reads **"Live AI"**. A business judge who reads "Demo mode" assumes it's canned,
  and the mock reply to a trick attempt ("That's not something I can do here…") is generic. If you have to fall back to
  mock, **leave the badge as it is**: don't relabel canned replies as live.
- During the demo, never hover **Re-grade** (review hero), **Delete** (assessment page) or **Reset demo** (dashboard).
  If there are 3 spare minutes, wrap Re-grade and Delete in an `@if (!demoStage)` flag, or just zoom so they are off-screen.

**Not worth the time today:** the submitted screen's "— AI messages" (`take.html:259`; just don't show that screen), the
builder's length, and a dedicated compare view (the Sessions table already does the job).

---

## Which screens to show, in this order (≈5 min)

| # | Screen | Time | What the judge should take away |
|---|---|---|---|
| 1 | **Landing `/`**, with the proof card from change 4 | 10 s | "Hiring teams; AI that helps but won't give the answer." Say the tagline, then switch to the candidate tab (don't click through the landing page). |
| 2 | **`/take/PRICING1`** (fresh, after reset): brief · memo · AI helper | 90 s | The three pasted messages; the "$24 is the right answer and it still won't confirm" pause. |
| 3 | **Price It Right detail → Sessions table** | 20 s | Jordan **18** red, Priya **72** green, AI bars 25 vs 78. "Same case, same AI." |
| 4 | **Jordan's review**, top half only | 40 s | "Weak · leaned on AI too much"; the red cards: asked for the answer 3×, tried to trick the AI once, every hint back to back. |
| 5 | **Priya's review → message 3 shield** | 40 s | "Caught before the candidate saw it." The near miss, in plain words. |
| 6 | **Builder → AI helper rules** (toggles plus the "What the candidate sees" preview) | 30 s | "You set the rules in plain English; the answer key is locked." |
| 7 | Back to **Landing** for the close | 10 s | "ChatGPT gives candidates the answer. Hintwise shows you who could have found it." |

**Cut from the demo:** the dashboard card grid (one glance at most), `/candidate` (the invite-code page), the submitted
confetti screen, "How the answer scored", "Their answer vs the answer key", hint costs, blocked phrases, and the A/B case
(mention it in one sentence only if you have time).
