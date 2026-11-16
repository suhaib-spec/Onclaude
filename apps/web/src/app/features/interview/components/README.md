# components — live interview building blocks

## Purpose
Small, reusable pieces for the live interview screens.

## Contents
- `typewriter.ts` — reveals text letter by letter and reports when it is "typing" (drives the speaking ring).
- `rubric-card.ts` — one skill card: job-post quote, animated 0–5 score bar, latest evidence, strong/ok/weak chip.
- `live-interviews-list.ts` — the "Live interviews" section on `/interviewer` (status, score, recommendation, link to `/live/:id`).

## Key decisions
- Score bars start at zero and grow on first render so the change is visible; a card glows briefly when its score changes.

## Related tasks
T-021
