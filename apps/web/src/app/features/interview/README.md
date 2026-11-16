# features/interview — live AI interview

## Purpose
The headline demo: paste a job description, and an AI interviewer runs a live interview built from it while the
interviewer watches scores fill in, skill by skill, with the exact lines from the job post they are based on.

## Contents
- [`new-interview/`](./new-interview/README.md) — `/interview/new`: job description form and the "building your rubric" step.
- [`live-stage/`](./live-stage/README.md) — `/live/:id`: the split-screen stage (candidate room + interviewer panel).
- [`components/`](./components/README.md) — small pieces used by the screens above and by the interviewer dashboard.

## Key decisions
- Built against `docs/mvp/LIVE_INTERVIEW_SPEC.md`; all data comes from `/api/interviews*` via `ApiService`.
- The existing case-based flow stays; this sits next to it (landing hero button, "Live interviews" on `/interviewer`).

## Related tasks
T-021
