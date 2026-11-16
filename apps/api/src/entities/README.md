# src/entities

## Purpose
TypeORM entities matching spec §3 (`synchronize: true`).

## Contents
- `assessment.entity.ts` — Assessment (`materials`, `rubric`, `guardrails` as jsonb; `referenceAnswer` protected).
- `session.entity.ts` — Session (unique `inviteToken`, counters, `evaluation`/`insights` jsonb).
- `message.entity.ts` — Message (`meta` jsonb).
- `index.ts` — exports and the `ENTITIES` list.

## Key decisions
- Plain uuid foreign-key columns (no relations) keep queries explicit; deletes cascade in the service.

## Related tasks
T-018
