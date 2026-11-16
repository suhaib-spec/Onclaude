# core — API contract and app state

## Purpose
The single typed boundary to the backend, plus small app-wide state.

## Contents
- `api.models.ts` — TypeScript interfaces copied from MVP_SPEC §3–§4 (Assessment, Session, Message/MessageMeta, Evaluation,
  Insights, candidate `TakeView`/`AiPolicy`/`Budget`/`PublicMessage`, `Health`).
- `api.service.ts` — `ApiService` (one Promise-returning method per endpoint) and `errorMessage()` that turns HTTP errors
  into friendly text (status 0/5xx → "backend not reachable", 404, 409).
- `ui-state.ts` — `ToastService` (deduplicated toasts) and `AppState` (role switch persisted in localStorage, LLM mode,
  API-down flag).

## Key decisions
- Keep field names identical to the spec so the backend and frontend can be checked side by side.
- Promises (`firstValueFrom`) instead of Observables in components: simpler async/await flows for a short-lived MVP.

## Related tasks
T-018
