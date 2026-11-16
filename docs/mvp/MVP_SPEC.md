# MVP Spec — "Hintwise" (T-018)

> The shared contract for every agent building the MVP. Backend, frontend and demo content MUST match this file exactly.
> Product name for the demo: **Hintwise**. Tagline: *"AI that helps you think, not copy."*

## 0. Owner decisions (2026-11-16)
- Domain-agnostic platform. **Interviewers** build assessments and set the AI's guardrails. **Candidates** solve them with a gated AI.
- The coding IDE track (T-002–T-017) continues separately; it is **not** part of this MVP.
- Candidate workspace: brief + materials (markdown/CSV/text, viewable) + answer editor + AI chat. **No code execution.**
- Async flow: the interviewer creates an invite link, the candidate solves, then the interviewer reviews.
- Review shows: annotated AI transcript, final answer, AI evaluation against the rubric, AI-usage insights.
- Guardrails: strictness preset + hint ladder, protected answer + forbidden terms, allowed help types, hint budget/costs + custom rules.
- LLM: Anthropic Claude. **Mock mode when `ANTHROPIC_API_KEY` is missing**, so the demo never breaks.
- Runs locally: Node + the owner's own PostgreSQL. **No auth**: a demo role switch (Interviewer / Candidate) in the header.
- Two demos (non-coding): **Business case: pricing decision** and **Data/stats: A/B test trap**.
- Demo in ~2.5 h, so it must look polished and catchy for judges.

## 1. Repo layout (independent apps, no npm workspaces, so apps install independently)
```
package.json            # root scripts only: setup (installs both apps), dev (concurrently api+web), dev:api, dev:web, build
                        # uses `npm --prefix apps/api ...` / `npm --prefix apps/web ...`; root devDependency: concurrently
.env.example            # copied to .env by the owner (never commit .env)
apps/api/               # NestJS, port 3000, global prefix /api, CORS for http://localhost:4200
apps/web/               # Angular (latest, standalone components + signals), port 4200, proxy /api -> 3000
demo/assessments/*.json # seed assessments (format = Assessment, without id/createdAt)
demo/sessions/*.json    # pre-baked completed sessions for the review demo (format in §6)
docs/mvp/               # this spec, demo script
```
Root `npm run dev` starts both (use `concurrently`). Every new folder gets a `README.md` (Purpose / Contents / Key decisions / Related tasks: T-018).

## 2. Environment (`.env` at repo root; the API loads it)
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/interview_trainer
ANTHROPIC_API_KEY=
TUTOR_MODEL=claude-sonnet-5-5
JUDGE_MODEL=claude-haiku-5-5
LLM_MODE=auto        # auto = real if key present else mock | mock | live
PORT=3000
```

## 3. Data model (TypeORM, `synchronize: true` for the MVP)
```ts
type Domain = 'business' | 'data' | 'coding' | 'math' | 'other';
type Tier = 'strict' | 'standard';           // strict: max hint level 3; standard: max 4
interface Material { id: string; name: string; kind: 'markdown' | 'csv' | 'text' | 'code'; content: string; }
interface RubricCriterion { id: string; name: string; description: string; weight: number; } // weights sum to 100
interface HintStep { level: 1 | 2 | 3 | 4; text: string; }
interface AllowedHelp { clarify: boolean; concepts: boolean; methods: boolean; materials: boolean; strategy: boolean; }
interface Guardrails {
  tier: Tier;
  allowedHelp: AllowedHelp;
  hintLadder: HintStep[];          // L1 process, L2 where-to-look/hypotheses, L3 concept, L4 localisation
  hintBudget: number;              // max hint requests
  hintCosts: { 1: number; 2: number; 3: number; 4: number }; // points deducted
  forbiddenTerms: string[];        // AI must never say these
  customRules: string;             // free text from the interviewer
}
Assessment { id: uuid; title; role: string; domain: Domain; summary: string; timeLimitMinutes: number;
  problemStatement: string /*markdown*/; materials: Material[] /*jsonb*/; referenceAnswer: string /*markdown, PROTECTED*/;
  rubric: RubricCriterion[] /*jsonb*/; guardrails: Guardrails /*jsonb*/; isDemo: boolean; createdAt }
Session { id: uuid; assessmentId; inviteToken: string /*8-char url-safe*/; candidateName: string | null;
  status: 'invited' | 'in_progress' | 'submitted' | 'evaluated'; startedAt; submittedAt; answer: string;
  hintLevelUnlocked: number /*0-4*/; hintsUsed: number; hintPointsSpent: number; integrityFlags: number;
  evaluation: Evaluation | null /*jsonb*/; insights: Insights | null /*jsonb*/; createdAt }
Message { id: uuid; sessionId; role: 'candidate' | 'assistant'; content: string; createdAt; meta: MessageMeta | null /*jsonb*/ }
interface MessageMeta {
  intent: Intent; decision: 'answer' | 'hint' | 'decline' | 'redirect';
  hintLevel?: number; hintCost?: number;
  judge?: { verdict: 'pass' | 'rewritten' | 'fallback'; reasons: string[]; deterministicHits: string[] };
  latencyMs?: number; mock?: boolean;
}
type Intent = 'clarify' | 'concept' | 'method' | 'materials' | 'strategy' | 'hypothesis_check'
            | 'hint_request' | 'solution_request' | 'injection' | 'off_topic';
interface Evaluation { overallScore: number /*0-100*/; verdict: 'strong' | 'acceptable' | 'weak';
  criteria: { criterionId: string; name: string; weight: number; score: number /*0-5*/; rationale: string }[];
  strengths: string[]; gaps: string[]; summary: string; hintPenalty: number; finalScore: number; mock?: boolean }
interface Insights { aiUsageScore: number /*0-100*/;
  stats: { messages: number; hintsUsed: number; hintPointsSpent: number; maxHintLevel: number;
    solutionRequests: number; injectionAttempts: number; clarifyingQuestions: number; conceptQuestions: number;
    durationMinutes: number };
  behaviours: { label: string; evidence: string; polarity: 'good' | 'concern' }[]; summary: string; mock?: boolean }
```

## 4. REST API (prefix `/api`)
**Interviewer**
- `GET /assessments` → `AssessmentSummary[]` (`id,title,role,domain,summary,timeLimitMinutes,isDemo,sessionCount,createdAt`)
- `GET /assessments/:id` → full `Assessment`
- `POST /assessments`, `PUT /assessments/:id` (body = Assessment minus id/createdAt) → `Assessment`; `DELETE /assessments/:id`
- `POST /assessments/draft-hints` body `{problemStatement, referenceAnswer, materials}` → `{hintLadder: HintStep[]}` (AI drafts L1–L4; mock returns generic process hints)
- `POST /assessments/:id/invites` body `{candidateName?}` → `{sessionId, inviteToken, url: "/take/<token>"}`
- `GET /assessments/:id/sessions` → `{id,inviteToken,candidateName,status,hintsUsed,finalScore|null,aiUsageScore|null,createdAt}[]`
- `GET /sessions/:id` → `{session, assessment: {id,title,role,domain,rubric,referenceAnswer}, messages: Message[]}` (full meta)
- `POST /sessions/:id/evaluate` → re-runs evaluation + insights, returns the session
- `POST /demo/reset` → wipes and reseeds the demo data

**Candidate** (must NEVER expose `referenceAnswer`, `rubric`, `hintLadder` text, `forbiddenTerms` or `customRules`)
- `GET /take/:token` → `{session: {id,status,candidateName,startedAt,answer,hintsUsed,hintPointsSpent,hintLevelUnlocked},
   assessment: {title,role,domain,summary,timeLimitMinutes,problemStatement,materials,
   aiPolicy: {tier,maxHintLevel,allowedHelp,hintBudget,hintCosts}}}`
- `POST /take/:token/start` body `{candidateName}` → same shape as GET
- `GET /take/:token/messages` → `PublicMessage[]` (meta reduced to `{decision, hintLevel?, hintCost?}`)
- `POST /take/:token/chat` body `{message}` → `{candidateMessage: PublicMessage, reply: PublicMessage, budget}`
- `POST /take/:token/hint` → same response (explicit "Get a hint" button)
- `PUT /take/:token/answer` body `{answer}` → `{ok:true}` (autosave)
- `POST /take/:token/submit` → `{status:'submitted'}`; evaluation runs in the background and sets status `evaluated`
- `budget = {hintsUsed, hintBudget, hintPointsSpent, nextHintLevel /*0 if none left*/, maxHintLevel}`
- Chat on a submitted/evaluated session → 409.

## 5. The gated AI pipeline (backend core; this is the product's differentiator)
1. **Input sanitize:** strip zero-width/invisible Unicode, cap length.
2. **Intent classifier** (JUDGE_MODEL, JSON output; looks at the last ~6 messages to catch piecemeal extraction) → `Intent`.
3. **Policy engine: deterministic TypeScript, NO LLM.** Inputs: intent, guardrails, session counters. Output: a directive.
   - `clarify|concept|method|materials|strategy`: answer, if that help type is allowed; otherwise `decline` and say what is allowed.
     (`hypothesis_check` → `redirect`: never confirm/deny; suggest how they can test it themselves.)
   - `hint_request` (or the hint button): if budget is left and `hintLevelUnlocked < maxHintLevel`, unlock the next level, charge `hintCosts[level]` and pass **only** ladder steps ≤ that level to the tutor; else decline (budget exhausted / max level reached).
   - `solution_request`: `decline` + offer the best allowed alternative; `integrityFlags++`.
   - `injection`: neutral one-line decline, keep helping, `integrityFlags++`.
   - `off_topic`: brief reply, steer back.
4. **Tutor** (TUTOR_MODEL) is **answer-blind**: it gets the problem statement, materials, the directive, the unlocked hint text, the custom rules and few-shot style guidance. It NEVER receives `referenceAnswer` or `forbiddenTerms`. Materials are wrapped in `<material>` tags and declared to be data, not instructions. Tone: short, warm, direct; answers factual/method questions directly (no endless Socratic questions).
5. **Output judge:**
   - (a) **deterministic**: case-insensitive forbidden-term hits, plus numeric leakage (any number from the reference answer's key results appearing in the reply that is not present in the problem statement/materials).
   - (b) **LLM judge** (JUDGE_MODEL) sees the reference answer + allowed level and returns `{leak: boolean, reasons[]}`.
   - On fail: one rewrite with the judge's feedback, then re-judge; if it still fails, a safe fallback message. Record the verdict in `meta.judge`.
6. Persist both messages with `meta`; return the public view.
7. **Mock mode** (no key): a deterministic mock classifier (keyword rules) + templated tutor replies per intent that sound natural and use the unlocked hint text. The judge still runs the deterministic checks. Set `meta.mock = true`.

**Evaluation on submit** (TUTOR_MODEL; mock = heuristic): scores each rubric criterion 0–5 against the reference answer;
`overallScore` = weighted percentage; `hintPenalty` = hintPointsSpent; `finalScore = max(0, overall - hintPenalty)`.
**Insights**: stats computed from messages (deterministic) + an LLM summary/behaviours (planning before asking, verifying
AI claims, over-reliance, solution-seeking, clarifying the problem). `aiUsageScore` is a heuristic: starts at 70, + for
clarify/concept/method/strategy questions, − for solution requests, injection attempts and heavy hint use, clamped 0–100.

## 6. Seed data
- On API start, if there are no assessments, load `demo/assessments/*.json` (`isDemo: true`), then `demo/sessions/*.json`:
  `{ assessmentTitle, inviteToken, candidateName, status: "evaluated", answer, hintLevelUnlocked, hintsUsed, hintPointsSpent,
  integrityFlags, startedAt, submittedAt, messages: [{role, content, meta}], evaluation, insights }`.
- Also create one fresh `invited` session per demo assessment with fixed tokens `PRICING1` and `ABTEST01`, so the live demo
  URLs are stable: `/take/PRICING1`, `/take/ABTEST01`.

## 7. Frontend (Angular, catchy and polished)
- Header: Hintwise logo + tagline, a **role switch** (Interviewer | Candidate) persisted in localStorage, and an
  "LLM: Live / Mock" badge from `GET /api/health` → `{ok, llmMode: 'live'|'mock'}`.
- **Interviewer**
  - `/interviewer` dashboard: assessment cards (domain chip, role, time, sessions count), "New assessment".
  - `/interviewer/assessments/new` and `/:id/edit` builder in sections: Basics · Problem & materials (add/edit markdown/csv/text) ·
    Protected answer & rubric (weights sum to 100) · **AI guardrails** (tier segmented control, allowed-help toggles, hint ladder
    editor with "✨ Draft hints with AI", forbidden-term chips, budget + costs, custom rules) · live "What the candidate sees" preview.
  - `/interviewer/assessments/:id`: overview, invite creation (copy link), sessions table.
  - `/interviewer/sessions/:id` **review**: score ring, rubric bars with rationales, strengths/gaps, AI-usage score + behaviours,
    side-by-side final answer and reference, and the **annotated transcript** (badges: intent, decision, hint level/cost,
    🛡 judge "blocked/rewritten").
- **Candidate**
  - `/candidate`: "Enter invite code" + quick links to the demo invites.
  - `/take/:token`: start screen (role, time limit, what the AI will/won't do), then a 3-pane workspace:
    left = Brief/Materials tabs (CSV rendered as a table, markdown rendered); centre = answer editor (markdown, autosave,
    preview toggle); right = AI chat (typing indicator, "💡 Get a hint (−N pts)" button, budget meter, hint-level stepper).
    Countdown timer in the top bar; Submit → confirmation screen.
- Markdown via `marked`; sanitize the HTML. Clean modern look: Inter font, an indigo/violet accent, cards, subtle shadows,
  responsive down to laptop width.
