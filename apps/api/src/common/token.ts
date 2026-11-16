import { randomInt } from 'crypto';

// Unambiguous uppercase alphabet (no 0/O, 1/I/L) — easy to read aloud and type.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** 8-char URL-safe invite token. */
export function newInviteToken(): string {
  let t = '';
  for (let i = 0; i < 8; i++) t += ALPHABET[randomInt(ALPHABET.length)];
  return t;
}
