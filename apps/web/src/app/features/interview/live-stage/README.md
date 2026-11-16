# live-stage — `/live/:id` (the stage view)

## Purpose
The demo screen. Left: the candidate's room. Right: what the interviewer sees, updated after every answer.

## Contents
- `live-stage.ts` / `.html` / `.scss` —
  - **Candidate room:** AI interviewer avatar with a pulsing ring while it "speaks", the current question typed out
    letter by letter, "Question 2 of 4" progress with the skill being tested, the conversation (new messages slide in and
    the list scrolls to the latest), and the answer box (Enter sends, Shift+Enter adds a line). 🎤 voice answers appear
    only when the browser supports speech recognition; 🔊 reads questions aloud. A "thinking" animation shows while waiting.
  - **Interviewer panel:** overall score ring, hire recommendation, a one-line call to action, one card per skill
    (job-post quote, animated 0–5 bar, latest evidence quote, strong/ok/weak), and strengths/concerns once finished.
  - **View switch:** Both / Candidate / Interviewer.

## Key decisions
- After each answer the AI's replies (acknowledgement, then next question) are revealed one at a time so it feels live.
- While in progress, the panel shows a "Live read: leaning …" line worked out from the current scores (weighted
  average × 20, same thresholds as the server); the final scorecard replaces it when the interview ends.

## Related tasks
T-021
