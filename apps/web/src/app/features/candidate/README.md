# features/candidate — candidate screens

## Purpose
The candidate journey: open an invite, read what the AI helper will and won't do, solve with the gated AI, submit.

## Contents
- `candidate-home/` — invite-code entry (accepts a code or a full link) and quick links to `/take/PRICING1`, `/take/ABTEST01`.
- `take/` — one route, three phases driven by `session.status`:
  - **start** (`invited`): role, time limit, AI policy card, name → `POST /take/:token/start`.
  - **workspace** (`in_progress`): top bar with countdown (from `startedAt + timeLimitMinutes`) and Submit; left pane
    Brief/Materials tabs (CSV as table); centre answer editor with debounced autosave (`PUT /answer`) and preview toggle;
    right pane AI chat with typing indicator, suggestion chips, hint stepper (Hint 1–4, unlocked/next/locked), hints-left meter,
    "💡 Get a hint (−N pts)" button. Submit opens a confirm dialog.
  - **done** (`submitted`/`evaluated`): confirmation screen.

## Key decisions
- Only the public candidate API is used; nothing protected is ever requested.
- Chat or autosave returning 409 reloads the view and lands on the done screen.
- The timer does not auto-submit; it turns red and asks the candidate to submit (safer for a live demo).

## Related tasks
T-018
