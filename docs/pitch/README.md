# docs/pitch/

## Purpose
Presentation material for the Hintwise demo: the PowerPoint deck and the presenter script, written in plain English for
non-technical judges.

## Contents
| File | Description |
|---|---|
| `Hintwise_Pitch.pptx` | 11-slide deck (9 main + 2 backup), with speaker notes. |
| `Hintwise_Presenter_Script.docx` | Slide-by-slide speaking script (~5½ min), with the exact demo chat messages, fallbacks and likely questions. |
| `Hintwise_Live_Interview_Pitch.pptx` | 7-slide pitch for the Live AI Interview (T-021). |
| `Hintwise_Live_Pitch_Script.docx` | 5-minute script for that deck, with the answers to paste in the demo. |
| `build-live-deck.js` | Generator for the live-interview deck. |
| `build-deck.js` | pptxgenjs script that generates the deck (rerun to rebuild after edits). |

## Key decisions
- Plain language only (no "LLM", "policy engine", "API"); one idea per slide; dark/violet/light rhythm matching the app.
- The demo slide does not reveal that $24 is correct, so the live "confirm $24?" moment still lands.
- Pricing tiers are pilot estimates from the investor review (`docs/review/01-investor-judge.md`).

## Related tasks
- T-020, T-021
