# src/ai — the gated AI pipeline

## Purpose
Everything that decides **what the AI may say** (spec §5) plus evaluation and insights. This is the product's core.

```
candidate msg → sanitize → intent classifier → policy engine (pure TS) → answer-blind tutor → output judge → reply
                                                                                          ↳ 1 rewrite → safe fallback
```

## Contents
| File | What |
|---|---|
| `gated-assistant.ts` | Orchestrates one chat turn; returns texts, `meta` and new counters (no DB access) |
| `sanitize.ts` | Strips invisible/bidi Unicode, normalises whitespace, caps length (2000) |
| `intent-classifier.ts` | JUDGE_MODEL JSON classifier over the last 6 messages; keyword rules for mock/fallback; injections are always caught by rules |
| `policy-engine.ts` | **Deterministic** directive: answer / decline / redirect / hint, hint budget + costs, integrity flags |
| `tutor.ts` | TUTOR_MODEL reply, **answer-blind** (never sees reference answer, rubric or forbidden terms); varied mock templates |
| `mock-glossary.ts` | General concept definitions so mock replies to concept/method questions are genuinely useful |
| `output-judge.ts` | Deterministic forbidden-term + numeric-leak checks, then an LLM leak judge (live) |
| `evaluation.ts` | Rubric scoring (LLM) or keyword heuristic; computes overall, hint penalty, final score, verdict |
| `insights.ts` | Deterministic stats + `aiUsageScore`; LLM or heuristic behaviours/summary |
| `hint-drafter.ts` | "Draft hints with AI" (L1–L4), rejected if it leaks reference numbers; generic hints in mock |
| `json.ts` | Robust JSON extraction from model output |
| [`llm/`](./llm/README.md) | `LlmProvider` interface, Anthropic and mock providers |
| [`prompts/`](./prompts/README.md) | All prompts, one file per model task |
| `*.spec.ts` | Unit tests (policy engine, judge, rules, sanitizer) |

## Key decisions
- The policy engine has no LLM: guardrails are enforced by code, the LLM only phrases the reply.
- Injection replies are deterministic in every mode (nothing for an attacker to work with).
- Every LLM call is wrapped: parse failures or API errors fall back to the mock logic, never a 500.
- Numeric leak check ignores single-digit integers and any number that appears in the brief/materials.
- `integrityFlags` counts **only** injection/manipulation attempts; solution requests are declined but only counted in
  `insights.stats.solutionRequests`.
- `aiUsageScore` ("AI collaboration", advisory) never penalises using the AI or hints as such. Starting at 70 it rewards
  clarifying, concept/method and hypothesis-testing questions and hints taken after effort; it penalises repeated
  solution-seeking, injection attempts and hints requested back-to-back with no attempt in between; clamped 0–100.
- Candidate-facing wording is plain English ("Here's a nudge (hint 2 of 4)…"), never "L2", "policy" or "tier".
- Candidate turns record `meta.mock` so the review shows whether a turn was live or mocked.

## Related tasks
T-018
