import { Inject, Injectable, Logger } from '@nestjs/common';
import { parseJsonObject } from './json';
import { LLM_PROVIDER, LlmProvider } from './llm/llm.provider';
import { buildJudgeUserPrompt, JUDGE_SYSTEM } from './prompts/judge.prompt';

export interface JudgeContext {
  referenceAnswer: string;
  forbiddenTerms: string[];
  /** Problem statement + material contents: numbers that appear here are not leaks. */
  publicText: string;
  maxAllowedHintLevel: number;
  candidateMessage: string;
}

export interface JudgeResult {
  ok: boolean;
  reasons: string[];
  deterministicHits: string[];
}

export const SAFE_FALLBACK =
  "I want to be careful not to give away the answer here. Let's step back: what is the one decision the brief asks you to make, and which number in the materials would change it? I'm happy to explain any concept or method along the way.";

// ------------------------------------------------------------ deterministic checks (pure)

/** Case-insensitive forbidden-term hits (whole-word for single words, substring for phrases). */
export function forbiddenTermHits(reply: string, terms: string[]): string[] {
  const text = reply.toLowerCase();
  const hits: string[] = [];
  for (const raw of terms ?? []) {
    const term = String(raw ?? '').trim().toLowerCase();
    if (!term) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = /^[\p{L}\p{N}]+$/u.test(term) ? new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'u') : new RegExp(escaped);
    if (re.test(text)) hits.push(raw);
  }
  return hits;
}

const NUMBER_RE = /(?<![\p{L}\d.])[-+]?\$?\d[\d,]*(?:\.\d+)?/gu;

/** Canonical numeric strings ("1,200.50" -> "1200.5"). */
export function extractNumbers(text: string): string[] {
  const out: string[] = [];
  for (const m of String(text ?? '').match(NUMBER_RE) ?? []) {
    const n = Number(m.replace(/[$,+]/g, ''));
    if (Number.isFinite(n)) out.push(String(n));
  }
  return out;
}

/**
 * Numbers from the reference answer's key results that appear in the reply but are NOT in the
 * problem statement / materials. Single-digit integers are ignored (too common to be meaningful).
 */
export function numericLeaks(reply: string, referenceAnswer: string, publicText: string): string[] {
  const isTrivial = (n: string) => /^-?\d$/.test(n);
  const ref = new Set(extractNumbers(referenceAnswer).filter((n) => !isTrivial(n)));
  const pub = new Set(extractNumbers(publicText));
  const leaks = new Set<string>();
  for (const n of extractNumbers(reply)) {
    if (ref.has(n) && !pub.has(n)) leaks.add(n);
  }
  return [...leaks];
}

export function deterministicCheck(reply: string, ctx: JudgeContext): string[] {
  return [
    ...forbiddenTermHits(reply, ctx.forbiddenTerms).map((t) => `forbidden term: "${t}"`),
    ...numericLeaks(reply, ctx.referenceAnswer, ctx.publicText).map((n) => `reference number: ${n}`),
  ];
}

/**
 * Step 5 of the pipeline: the OUTPUT JUDGE.
 * (a) deterministic forbidden-term + numeric-leak checks, (b) LLM leak judge (JUDGE_MODEL) in live mode.
 */
@Injectable()
export class OutputJudge {
  private readonly log = new Logger(OutputJudge.name);
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  async judge(reply: string, ctx: JudgeContext): Promise<JudgeResult> {
    const deterministicHits = deterministicCheck(reply, ctx);
    if (deterministicHits.length) {
      return { ok: false, reasons: deterministicHits, deterministicHits };
    }
    if (this.llm.mode === 'live' && ctx.referenceAnswer.trim()) {
      try {
        const raw = await this.llm.complete({
          model: 'judge',
          system: JUDGE_SYSTEM,
          messages: [
            {
              role: 'user',
              content: buildJudgeUserPrompt({
                referenceAnswer: ctx.referenceAnswer,
                maxAllowedHintLevel: ctx.maxAllowedHintLevel,
                candidateMessage: ctx.candidateMessage,
                draft: reply,
              }),
            },
          ],
          maxTokens: 200,
        });
        const parsed = parseJsonObject<{ leak: boolean; reasons?: string[] }>(raw);
        if (parsed && typeof parsed.leak === 'boolean') {
          const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.map(String).slice(0, 5) : [];
          return { ok: !parsed.leak, reasons: parsed.leak ? (reasons.length ? reasons : ['LLM judge flagged a leak']) : [], deterministicHits: [] };
        }
        this.log.warn('Unparseable judge output; relying on deterministic checks.');
      } catch (err: any) {
        this.log.warn(`Judge LLM failed (${err?.message}); relying on deterministic checks.`);
      }
    }
    return { ok: true, reasons: [], deterministicHits: [] };
  }
}
