# new-interview — `/interview/new`

## Purpose
Start a live interview from a job description.

## Contents
- `new-interview.ts` — form (job title, company, candidate name, job description) prefilled from `GET /api/interviews/demo-jd`;
  "Generate interview" shows a short checklist animation ("Reading the job description… building your rubric") and then opens `/live/:id`.

## Key decisions
- The animation runs for at least ~3 seconds even if the server is faster, so viewers can see what the AI is doing.

## Related tasks
T-021
