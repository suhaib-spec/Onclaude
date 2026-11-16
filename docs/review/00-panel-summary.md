# 00 — Panel summary: what we changed, and what's left as talking points

> Consolidates the three pre-pitch reviews of the Hintwise MVP (T-018, 2026-11-16):
> [01 investor judge](./01-investor-judge.md) · [02 buyer judge](./02-buyer-judge.md) · [03 story coach](./03-story-coach.md).

## Where the three reviews agree
1. **Great product demo, weak business pitch.** The live refusal and the 🛡 "rewritten" badge are the moments judges
   will remember (all three). The deck reads like a research talk: too many statistics and too much architecture (01, 02, 03).
2. **Show the product catching someone.** Both pre-baked candidates were "decent", so the AI-usage report looked like
   decoration (02 #1; implied by 01 and 03).
3. **Plain English.** Words like hint ladder, policy engine, judge, injection, SRM and LTV lose a business panel (02 #5, 03 §5).
4. **Don't treat asking for help as an integrity issue.** Only attempts to trick the AI are integrity events (02 #3; 01 Q3 heads-up).
5. **Lead with the experience, end on control:** candidate → review → builder (02 #2), with three wow moments (03 §4).

## What we changed (done)
| Change | Where | Review |
|---|---|---|
| Added an **over-reliant contrast candidate**, Jordan Lee (`DEMOPR02`): asks for the answer 3 times, one trick attempt, burns all 4 hints back to back, recommends the trap price $14. Rubric 37 − 19 hint points = **18**; AI collaboration **25**. | `demo/sessions/pricing-weak-session.json` | 02 #1 |
| **Integrity flags now count only attempts to trick the AI.** Priya 1 → **0**; Daniel stays 1 (his was a trick attempt); Jordan 1. Requests for the answer are a behaviour note. | all `demo/sessions/*.json`, validator | 02 #3, 01 Q3 |
| AI-collaboration heuristic no longer penalises hint points; it penalises requests for the answer (−6), trick attempts (−15) and hints taken back to back with no effort between (−4). Priya 75 → **78**, Daniel 70 → **73**. | `demo/scripts/build_demo_content.py` | 01 Q3 heads-up, 02 #3 |
| **Plain-English pass** on user-facing text: "Hint 2 of 4 (−3 points)" instead of "Level 2", "Key idea:" instead of "Concept —", "five test prices" instead of "five arms", and "answer checker" instead of "judge" in the behaviour notes. Numbers and traps unchanged. The validator now rejects level codes, "judge" and "policy" in assistant replies. | `demo/assessments/*.json`, `demo/sessions/*.json` | 02 #5, 03 §5 |
| Behaviour labels softened: "Asked for the answer once, under time pressure", "Tried to trick the AI once". | sessions | 02 #3, 03 §5 |
| **Demo script rewritten:** the story coach's words, in the buyer's order. Candidate (~90 s, 3 messages including the "$24, confirm?" moment) → **the two memos** (Priya 72 vs Jordan 18, side by side) → builder (~30 s) → close on "Help, not answers." Exact chat messages kept for mock mode. | `docs/mvp/DEMO_SCRIPT.md` | 02 #2, 03 §4 |

## What's left as talking points (not built; say it, don't claim it)
**Positioning and the deck** (owner/team to apply to `docs/mvp/PITCH_DECK.md` or the slides):
- **One buyer: hiring teams.** Candidates practise free (the funnel); universities come later (01 #1).
- **Tagline:** "Help, not answers." (03 §2); the employer-framed alternative is "Interview the way they'll actually work: with AI, on your rules." (01 #1).
- **Cut to 8 slides** with one picture each ("Set · Solve · See"); move the three-check architecture and the research numbers to backup slides (03 §3, 01 #4).
- **The one-line moat:** "The AI talking to the candidate never sees the answer. The only part that knows the answer never talks to the candidate." (01 #4)
- **Defensibility is the data:** a dataset of AI-collaboration behaviour, a library of trap cases for every role, and a published leak benchmark (01 #4).

**Business model** (no pricing exists in the repo yet; agree on it as a team before quoting):
- Reviewer-proposed pilot pricing: Free practice · Team ~$300/mo · Growth ~$1,200/mo · Enterprise custom (01 #3). These are **estimates**.
- Market figures suggested by the investor review (from external sources it cites, not yet in `docs/research/`): $1.34B → $3.01B
  pre-employment assessment software (2025 → 2034); Gartner: 39% of candidates use AI when applying. Quote them only with the source named (01 #2).
- **The ask:** 3 design partners in 30 days for analyst, PM or ops roles, plus the dare: "If you can get it to give you the answer, we'll buy you dinner." Only do the dare if the live gate has been rehearsed against many trick attempts (01 #5, 03 slide 8).

**Trust and compliance** (the buyer's questions; have answers ready):
- A person makes every decision; the score is advice with a reason for each point, and the reviewer can override any line (02 Q2, 01 Q3).
- Candidates are told up front that the chat is recorded and shared with the hiring team, and what's scored (02 "worries").
- Accommodations: extra time or extra hints per candidate. "Count hints in the score" should become an interviewer on/off choice (02 #3).
- Pilot plan: compare AI scores with human graders, and check outcomes across candidate groups (NYC Local Law 144 and the EU AI Act treat AI hiring tools as high-risk) (02 Q2, 01 Q3).
- Data: transcript retention and deletion, which AI vendor sees the data, and no training on it (02 "worries").

**Product ideas for the roadmap slide** (not built):
- UI renames from the buyer's jargon table: "AI collaboration" band (Strong / Mixed / Over-reliant), separate counters for "Asked for the answer" and "Tried to trick the AI", "Answer checker", "Answer key (private)" (02 table).
- A side-by-side candidate comparison view (02 #1).
- Setup help: "Draft rubric" and "Suggest blocked phrases" next to "Draft hints with AI", plus a template library (02 #5).
- Per-candidate case variants (shuffled numbers or a different company) so answers can't spread on Glassdoor (02 "worries").
- ATS links (Greenhouse, Workday), live interviews, and the coding track (01, 02).

**Ready answers to the toughest questions:** see 01 §4 (incumbents, who pays, validity and legal risk, "ChatGPT on the phone")
and 02 "3 tough questions" (why pay, legal exposure, time saved and setup effort).
