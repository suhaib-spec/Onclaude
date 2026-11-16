# demo/scripts/

## Purpose
Tooling that generates and verifies the demo content.

## Contents
| File | Description |
|---|---|
| `build_demo_content.py` | Builds the CSVs, reference answers, assessments and pre-baked sessions; prints the key numbers; validates everything (exits non-zero on failure). Run: `python3 demo/scripts/build_demo_content.py` (standard library only). |

## Key decisions
- Validation checks: JSON parses; rubric weights sum to 100; hint ladder L1–L4, budget and costs; CSVs ≤ 20 rows; no forbidden term in tutor-visible text
  or in any assistant reply; `overallScore` = weighted rubric %, `finalScore = overall − hintPenalty`, `hintPenalty = hintPointsSpent`;
  hint costs match the guardrails; insight stats match the transcript.
- Design asserts guard the traps (e.g. $24 must beat the max-conversion and max-revenue arms; every A/B segment must be flat or negative for B while the aggregate favours B with p < 0.001).

## Related tasks
- T-018
