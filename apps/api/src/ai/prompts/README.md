# src/ai/prompts

## Purpose
All model prompts, kept separate from logic so they can be reviewed and tuned on their own.

## Contents
| File | Model | Output |
|---|---|---|
| `classifier.prompt.ts` | JUDGE_MODEL | `{intent, confidence, reason}` |
| `tutor.prompt.ts` | TUTOR_MODEL | plain reply; answer-blind system prompt, materials in `<material>` tags, style few-shots, rewrite instruction |
| `judge.prompt.ts` | JUDGE_MODEL | `{leak, reasons[]}` (sees the reference answer) |
| `evaluation.prompt.ts` | TUTOR_MODEL | per-criterion 0–5 scores, strengths, gaps, summary |
| `insights.prompt.ts` | TUTOR_MODEL | behaviours + summary |
| `draft-hints.prompt.ts` | TUTOR_MODEL | 4-level hint ladder |

## Key decisions
- The tutor is domain-agnostic (business, data, maths, coding…), short and warm, answers concept/method questions
  directly, never confirms/denies hypotheses and never gives the final answer, numbers or recommendation.
- Untrusted text (materials, candidate messages, answers) is fenced in tags and declared to be data.
- JSON-only outputs are parsed tolerantly (`../json.ts`).

## Related tasks
T-018
