# src/ai/llm

## Purpose
The only place that talks to a model. Components depend on the `LlmProvider` interface (token `LLM_PROVIDER`).

## Contents
| File | What |
|---|---|
| `llm.provider.ts` | `LlmProvider` interface, request types, `MockModeError` |
| `anthropic.provider.ts` | Live provider (`@anthropic-ai/sdk`), models from `TUTOR_MODEL` / `JUDGE_MODEL`, 45 s timeout, 1 retry |
| `mock.provider.ts` | Mock provider: throws `MockModeError` so each caller uses its deterministic fallback |
| `llm.factory.ts` | Picks the provider: `LLM_MODE=mock` → mock; otherwise live only if `ANTHROPIC_API_KEY` is set |

## Key decisions
- Mock logic lives with each component (classifier rules, tutor templates, heuristic evaluation), not in the provider,
  so the same fallback also covers live-mode failures.

## Related tasks
T-018
