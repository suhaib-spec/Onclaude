/**
 * Robustly extracts the first JSON object from model output (handles ```json fences and chatter).
 * Returns null instead of throwing so callers can fall back.
 */
export function parseJsonObject<T = any>(text: string): T | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [fenced?.[1], text];
  for (const raw of candidates) {
    if (!raw) continue;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end <= start) continue;
    try {
      const parsed = JSON.parse(raw.slice(start, end + 1));
      if (parsed && typeof parsed === 'object') return parsed as T;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}
