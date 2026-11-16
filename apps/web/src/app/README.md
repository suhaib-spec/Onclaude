# src/app — Hintwise application

## Purpose
Root of the Angular app: shell (header with role switch and LLM badge, toasts), routing, and the feature screens.

## Contents
- `app.ts` / `app.html` / `app.scss` — shell: logo + tagline, Live/Mock LLM badge (`GET /api/health`), Interviewer | Candidate
  role switch (localStorage, auto-synced to the current route), offline banner, toast stack.
- `app.routes.ts` — lazy routes (see [apps/web README](../../README.md)).
- `app.config.ts` — HttpClient (fetch), router with component input binding.
- [`core/`](./core/README.md) — typed API client, contract types, app state and toasts.
- [`shared/`](./shared/README.md) — reusable UI: markdown pipe, CSV/material viewer, score ring, AI-policy card, labels.
- [`features/`](./features/README.md) — landing, interviewer and candidate screens.

## Key decisions
- Route params arrive as component `input()`s (`withComponentInputBinding`).
- State is local to each screen (signals); there is no global store, the API is the source of truth.

## Related tasks
T-018
