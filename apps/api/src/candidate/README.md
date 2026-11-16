# src/candidate

## Purpose
Candidate endpoints under `/api/take/:token`: view, start, messages, chat, hint, answer autosave, submit.

## Contents
| File | What |
|---|---|
| `candidate.controller.ts` | Routes |
| `candidate.service.ts` | Loads the session by token, runs the gated assistant, persists messages and counters |
| `public-view.ts` | **Whitelisted** projections: take view (with `aiPolicy`), `PublicMessage`, `budget` |
| `public-view.spec.ts` | Proves no protected field or text leaks |

## Key decisions
- Tokens are matched case-insensitively (stored upper-case).
- Chat/answer on an `invited` session auto-starts it; chat/answer/submit after submission → 409.
- The hint button stores the candidate message "Can I get a hint?" so the transcript stays readable.

## Related tasks
T-018
