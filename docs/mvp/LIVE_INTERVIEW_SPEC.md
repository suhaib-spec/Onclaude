# Live AI Interview: build spec (T-021)

Headline feature for the demo. An AI interviewer runs a live interview grounded in a **job description (JD)**: it asks a
question, waits for the candidate's answer, reacts to it (a short acknowledgement or a follow-up), and moves on. The
interviewer sees a **rubric built from the JD**, with live scores, evidence quotes and a **one-line call to action**.
The existing case flow stays as a secondary demo. **The demo runs WITHOUT an API key**, so mock mode must feel smart for the demo JD.

## Data (TypeORM entity `InterviewSession`, table `interview_sessions`, synchronize)
```ts
interface Competency { id: string; name: string; description: string; weight: number; jdQuote: string; keywords: string[] }
interface Question { id: string; competencyId: string; text: string; followUp: string }
interface LiveScore { competencyId: string; score: number /*1-5*/; signal: 'strong'|'ok'|'weak'; evidence: string; reason: string }
interface Turn { id: string; role: 'interviewer'|'candidate'; kind: 'greeting'|'question'|'follow_up'|'ack'|'answer'|'closing';
  text: string; at: string; competencyId?: string; questionIndex?: number; liveScore?: LiveScore }
interface CompetencyScore { competencyId: string; name: string; weight: number; score: number /*0-5, 1 decimal*/;
  jdQuote: string; evidence: string[]; summary: string }
interface Scorecard { overall: number /*0-100*/; recommendation: 'Strong hire'|'Hire'|'Lean no'|'No hire';
  cta: string /*ONE line the interviewer can act on*/; strengths: string[]; concerns: string[]; mock?: boolean }
InterviewSession { id uuid; jobTitle; company; jobDescription text; candidateName; status: 'in_progress'|'completed';
  competencies: Competency[]; questions: Question[]; currentIndex: number; followUpAsked: boolean;
  transcript: Turn[]; scores: CompetencyScore[] /*updated live after every answer*/; scorecard: Scorecard|null;
  createdAt; completedAt|null }
```

## API (prefix /api)
- `GET /interviews/demo-jd` → `{ jobTitle, company, jobDescription }` (the demo JD; used to prefill the form)
- `POST /interviews` `{ jobTitle, company, jobDescription, candidateName }` → `InterviewSession`. Builds 4 competencies
  (weights sum to 100, each with a `jdQuote` copied from the JD) and **4 questions** (one per competency, each with a
  follow-up). Adds the first interviewer turn: a warm one-line greeting, then question 1 as a separate `question` turn.
- `GET /interviews` → summaries `{id, jobTitle, company, candidateName, status, overall|null, recommendation|null, createdAt}[]`
- `GET /interviews/:id` → `InterviewSession`
- `POST /interviews/:id/answer` `{ text }` → `InterviewSession`. Appends the answer, scores it against the current
  question's competency (sets `liveScore` on the answer turn and recomputes `scores`), then:
  - weak/short answer and no follow-up asked yet for this question → a `follow_up` turn (and `followUpAsked=true`);
  - otherwise → a short `ack` that references something the candidate actually said, then the next `question`;
  - after the last question → a `closing` turn, `status=completed`, and the `scorecard`.
- `POST /interviews/:id/finish` → ends early: closing turn + scorecard.
- Seed: one completed demo interview (candidate "Maya Chen", strong) so the interviewer view has data immediately.

## Demo JD (mock mode must handle this one beautifully)
**Product Analyst at Quillstone** (an AI meeting-notes startup). Responsibilities: turn product and usage data into
decisions; run and read A/B tests and pricing experiments; work with product, sales and finance to prioritise; present
clear recommendations to leadership. Requirements: SQL/spreadsheets; experiment design; business sense (unit economics,
churn, LTV); clear communication with non-technical stakeholders; using AI tools responsibly to move faster.
Competencies: **Data-driven decisions** (30), **Experimentation** (25), **Business acumen** (25), **Communication & stakeholders** (20).
Each question is behavioural/situational ("Tell me about a time…", "How would you…"), with keywords for mock scoring.

## Mock intelligence (no key)
- **Scoring** (1–5): start at 2; +1 if ≥ 40 words; +1 if it contains numbers/%/$; +1 if ≥ 2 competency keywords; +0.5 for
  structure markers (e.g. "I led", "as a result", "because", "first… then", "the outcome"); −1 if < 12 words or vague
  ("I don't know", "not sure"). Clamp. `signal`: ≥4 strong, 3 ok, ≤2 weak. `evidence` = the candidate's sentence with the
  most keywords (verbatim, ≤ 25 words). `reason` = a short plain-English why.
- **Acks** reference a keyword or number the candidate used ("Good, quantifying the 12% churn drop makes that concrete.").
  Vary the phrasing; no robotic repetition.
- **Scorecard**: overall = weighted average × 20; recommendation thresholds ≥80 Strong hire, ≥65 Hire, ≥50 Lean no,
  else No hire; **cta** is one line naming the top strength and what to probe next, e.g.
  "Advance to final round: strong, data-driven decision-maker; probe stakeholder pushback in the panel."
- With a key (live): use the existing LlmProvider for competencies/questions from any JD, scoring with evidence, acks and
  follow-ups, and the scorecard, with the mock as a fallback on any error.

## Frontend (Angular, polished, dynamic; match the existing design system)
- **Landing:** primary hero CTA "🎙 Start a live AI interview" → `/interview/new`; the existing flows stay below.
- **`/interview/new`:** JD form (prefilled from `/interviews/demo-jd`), job title, company, candidate name; "Generate
  interview" shows a short animated "Reading the job description… building your rubric" then goes to `/live/:id`.
- **`/live/:id` = the STAGE VIEW (the demo screen):** split screen.
  - Left, the **candidate room**: AI interviewer avatar with a pulsing "speaking" ring, the current question large with a
    typewriter reveal, a "Question 2 of 4" progress bar with the competency chip, the conversation so far, and the answer box
    with a 🎤 mic button (Web Speech API `webkitSpeechRecognition` if available, else hidden) and Send. Optional 🔊
    read-aloud toggle (speechSynthesis). A "thinking…" animation while waiting.
  - Right, the **interviewer panel** (refreshes after every answer): overall gauge + recommendation pill; the **CTA
    banner** (one line, prominent; while in progress show "Live read: leaning Hire" style text); rubric cards per
    competency with the JD quote it's grounded in, an animated score bar (0–5), and the latest evidence quote with a
    strong/ok/weak chip; strengths and concerns when completed.
  - A toggle to show the candidate room only (full width) or the interviewer panel only.
- **`/interviewer`:** add a "Live interviews" section listing interviews (status, score, recommendation) linking to `/live/:id`.
- Plain English everywhere; no jargon.
