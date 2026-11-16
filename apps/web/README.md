# apps/web — Hintwise frontend (Angular)

## Purpose
The browser app for **Hintwise** ("Help, not answers."). Interviewers build assessments and set the rules for the AI
helper; candidates solve them in a 3-pane workspace with a gated AI; interviewers review the result. Built against the
contract in [`docs/mvp/MVP_SPEC.md`](../../docs/mvp/MVP_SPEC.md) §3–§4 (API) and §7 (UI).

## Run
```bash
npm install
npm start        # ng serve --proxy-config proxy.conf.json --port 4200  (needs apps/api on :3000)
npm run build    # production build into dist/web
```
`/api/*` is proxied to `http://localhost:3000` by [`proxy.conf.json`](./proxy.conf.json).

## Routes
| Route | Screen |
|---|---|
| `/` | Landing hero with "I'm an interviewer" / "I'm a candidate" |
| `/interviewer` | Dashboard: assessment cards, reset demo data |
| `/interviewer/assessments/new`, `/:id/edit` | Builder (basics, problem & materials, answer key & scoring, AI helper rules, live candidate preview) |
| `/interviewer/assessments/:id` | Overview, invite link creation + copy, sessions table |
| `/interviewer/sessions/:id` | Review: verdict headline, score, scoring breakdown, AI collaboration, answer vs key, annotated conversation |
| `/candidate` | Enter invite code + demo links (`/take/PRICING1`, `/take/ABTEST01`) |
| `/take/:token` | Start screen → 3-pane workspace → submitted screen |

## Contents
- [`src/app/`](./src/app/README.md) — the application (core services, shared UI, features).
- `src/styles.scss` — the design system (CSS variables, cards, buttons, chips, tables, markdown, animations).
- `src/index.html` — shell; loads Inter from Google Fonts with a system-font fallback.
- `proxy.conf.json` — dev proxy for `/api`.
- `angular.json` — build config (font inlining disabled so offline builds work; style budgets raised).

## Key decisions
- **Angular 22, standalone components, signals, zoneless**, lazy-loaded routes; no UI library (plain SCSS) to stay light.
- **`marked` + DOMPurify** for markdown; CSV materials are parsed client-side and rendered as a styled table.
- **Plain-English copy** for business-audience judges (tagline "Help, not answers.", "Answer key", "Blocked phrases",
  "Interview mode / Practice mode", "Hint 1 · Nudge"…). API field names are unchanged.
- Errors surface as toasts; a red banner appears when `/api/health` is unreachable (rechecked every 20 s).
- Production build sets `optimization.fonts: false` because font inlining fetches Google Fonts at build time.

## Related tasks
T-018
