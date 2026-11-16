# src/health

## Purpose
`GET /api/health` → `{ ok: true, llmMode: 'live' | 'mock' }` for the UI's LLM badge.

## Contents
- `health.controller.ts` — the endpoint.

## Key decisions
- `llmMode` reports the configured provider; in live mode individual failed calls still fall back to mock logic.

## Related tasks
T-018
