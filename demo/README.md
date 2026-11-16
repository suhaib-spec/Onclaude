# demo/

## Purpose
Seed content for the Hintwise MVP demo: two ready-to-run assessments (one business, one data) and one pre-baked,
fully evaluated candidate session for each, so the interviewer review page looks complete without a live run.
The API loads these files on start when the database has no assessments (see [MVP_SPEC §6](../docs/mvp/MVP_SPEC.md)).

## Contents
| Path | Description |
|---|---|
| [assessments/](./assessments/README.md) | `pricing.json` (Quillstone Pro pricing, business) and `abtest.json` (Harbor & Pine checkout A/B test, data), in the `Assessment` format without `id`/`createdAt`. |
| [sessions/](./sessions/README.md) | `pricing-session.json` (Priya, `DEMOPR01`, strong AI user), `pricing-weak-session.json` (Jordan, `DEMOPR02`, over-reliant) and `abtest-session.json` (Daniel, `DEMOAB01`): completed, evaluated sessions in the §6 seed format. |
| [scripts/](./scripts/README.md) | `build_demo_content.py`, which generates every dataset, reference answer, transcript and score, and validates them. |

## Key decisions
- **Generated, not hand-typed.** Every number (CSV rows, reference-answer figures, scores) comes from `scripts/build_demo_content.py`,
  so the materials, the reference answers and the evaluations can't drift apart. Edit the script, not the JSON, and re-run it.
- **Each case has a trap.** Pricing: the max-conversion ($9) and max-month-1-revenue ($14) arms lose money; $24 maximises lifetime
  contribution net of acquisition cost. A/B test: B "wins" +24% in aggregate only because of a sample ratio mismatch
  (B got 65% of desktop and 35% of mobile traffic); within every device B is flat or slightly worse (Simpson's paradox), so don't ship.
- **Forbidden terms never collide with tutor-visible text.** The validator checks that no forbidden term appears in the problem statement,
  materials, hint ladder or custom rules; otherwise the deterministic judge would block legitimate replies.
- **Pre-baked sessions show every gate behaviour** (clarify, concept/method, hypothesis redirect with a 🛡 `rewritten` judge verdict,
  hints, requests for the answer and trick attempts declined). Priya and Daniel give decent-but-imperfect answers; Jordan is the
  over-reliant contrast who falls into the pricing trap, so the review page shows the product catching someone.
- **Integrity flags count only attempts to trick the AI**; asking for the answer is a behaviour note, not an integrity issue.
- **All companies and people are fictional.**

## Related tasks
- T-018 — MVP: interviewer-built assessments with a gated AI assistant + 2 demo use cases
