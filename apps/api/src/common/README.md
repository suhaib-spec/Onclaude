# src/common

## Purpose
Shared types and small helpers.

## Contents
- `types.ts` — spec §3 types (Guardrails, MessageMeta, Evaluation, Insights, Intent…) and `maxHintLevelFor`.
- `token.ts` — 8-character invite tokens from an unambiguous upper-case alphabet.

## Key decisions
- `maxHintLevelFor` = tier max (strict 3, standard 4), capped by the highest authored ladder level.

## Related tasks
T-018
