# features — screens

## Purpose
One folder per screen, grouped by audience.

## Contents
- `landing/` — the root hero ("Interview the way they'll actually work: with AI, on your rules.") with role buttons.
- [`interviewer/`](./interviewer/README.md) — dashboard, builder, assessment detail, review.
- [`candidate/`](./candidate/README.md) — invite-code entry and the take flow.

## Key decisions
- Each screen is a standalone, lazy-loaded component; big screens split template/styles into `.html`/`.scss`.

## Related tasks
T-018
