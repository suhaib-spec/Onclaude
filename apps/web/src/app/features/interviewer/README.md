# features/interviewer — interviewer screens

## Purpose
Everything the interviewer does: create assessments and rules for the AI helper, invite candidates, review results.

## Contents
- `dashboard/` — assessment cards (domain, role, time, session count), "New assessment", "Reset demo" (`POST /demo/reset`).
- `builder/` — create/edit form in four sections: Basics · Problem & materials (markdown/CSV/text, upload) · Answer key &
  scoring (weights with a sum-to-100 indicator) · AI helper rules (Interview/Practice mode, allowed help toggles, hint levels
  editor with "✨ Draft hints with AI", blocked-phrase chips, number of hints + per-hint costs, extra instructions).
  A sticky "What the candidate sees" preview updates live.
- `assessment-detail/` — overview + rules summary, invite creation with copy link, sessions table (click → review).
- `review/` — the showpiece: plain-English verdict headline, one big score with "Answer N · hint deductions −M", scoring
  breakdown with rationales, what they did well / missed, AI collaboration (advisory) with behaviours, answer vs answer key,
  and the annotated conversation (intent, decision, hint level/cost, 🛡 answer checker blocked/rewrote + reasons) with filters.

## Key decisions
- The review polls while a session is `submitted` (evaluation runs in the background) or `in_progress`.
- "AI collaboration is advisory; a human makes the hiring decision." is shown next to the AI score on purpose.
- Builder edits a plain object with `ngModel`; derived values are methods (not `computed`) because fields mutate in place.

## Related tasks
T-018
