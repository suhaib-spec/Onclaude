export const MAX_MESSAGE_LENGTH = 2000;

// Zero-width, bidi-control and other invisible characters often used to smuggle instructions.
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F­͏؜ᅟᅠ឴឵᠎​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ￰-￻]|\uDB40[\uDC00-\uDC7F]/g;

/** Step 1 of the pipeline: strip invisible Unicode, normalise whitespace, cap length. */
export function sanitizeInput(raw: unknown, maxLength = MAX_MESSAGE_LENGTH): string {
  const text = String(raw ?? '')
    .normalize('NFKC')
    .replace(INVISIBLE, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}
