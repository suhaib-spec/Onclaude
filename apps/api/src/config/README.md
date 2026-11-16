# src/config

## Purpose
Runtime configuration that must work the same on Windows, macOS and Linux.

## Contents
- `paths.ts` — finds the repo root by walking up from `__dirname` (`path.resolve`), exposes `DEMO_DIR`.
- `env.ts` — loads `.env` from the repo root then the cwd; typed `config` getters with defaults; LLM mode logic.
- `ensure-database.ts` — creates the `DATABASE_URL` database via the `postgres` maintenance DB if it is missing.

## Key decisions
- Defaults equal `.env.example`, so the API runs even before a `.env` exists.

## Related tasks
T-018
