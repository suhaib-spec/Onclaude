# shared — reusable UI pieces

## Purpose
Small building blocks used by several screens.

## Contents
- `markdown.ts` — `md` pipe (marked → DOMPurify → trusted HTML) and `parseCsv()`.
- `material-view.ts` — renders a material: markdown, CSV (sticky-header table, numeric columns right-aligned), or text/code.
- `score-ring.ts` — animated circular score (0–100), colour by band.
- `ai-policy.ts` — "What the AI will / won't do" card from the public `aiPolicy` (builder preview and candidate start screen).
- `labels.ts` — plain-English labels: domains, intents ("Asked for the answer", "Tried to trick the AI"…), decisions,
  help types, hint level names (`hintName()` → "Hint 2 · Where to look"), modes, `relTime()`, `uid()`.

## Key decisions
- All user-facing wording for API enums lives in `labels.ts`, so copy can change without touching the API.
- DOMPurify sanitizes markdown before Angular renders it, so tables and code blocks keep their markup safely.

## Related tasks
T-018
