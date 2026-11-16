import { Injectable } from '@nestjs/common';
import { Intent, JudgeMeta, maxHintLevelFor, MessageMeta } from '../common/types';
import { Assessment, Message, Session } from '../entities';
import { IntentClassifier } from './intent-classifier';
import { decide, SessionCounters } from './policy-engine';
import { OutputJudge, SAFE_FALLBACK } from './output-judge';
import { sanitizeInput } from './sanitize';
import { Tutor } from './tutor';

export interface AssistantTurn {
  candidateText: string;
  candidateMeta: MessageMeta;
  replyText: string;
  replyMeta: MessageMeta;
  counters: SessionCounters;
}

export const HINT_BUTTON_MESSAGE = 'Can I get a hint?';

/**
 * The gated AI pipeline (spec §5):
 * sanitize -> classify intent -> deterministic policy -> answer-blind tutor -> output judge (+1 rewrite, fallback).
 * Pure orchestration: persistence is done by the caller.
 */
@Injectable()
export class GatedAssistant {
  constructor(
    private readonly classifier: IntentClassifier,
    private readonly tutor: Tutor,
    private readonly judge: OutputJudge,
  ) {}

  async respond(args: { assessment: Assessment; session: Session; history: Message[]; message?: string; hintButton?: boolean }): Promise<AssistantTurn> {
    const started = Date.now();
    const { assessment, session } = args;
    const guardrails = assessment.guardrails;

    // 1. sanitize
    const text = args.hintButton ? HINT_BUTTON_MESSAGE : sanitizeInput(args.message);
    const history = args.history.map((m) => ({ role: m.role, content: m.content }));

    // 2. intent
    let intent: Intent;
    let mock = false;
    if (args.hintButton) intent = 'hint_request';
    else {
      const res = await this.classifier.classify({ title: assessment.title, message: text, recent: history.slice(-6) });
      intent = res.intent;
      mock = res.mock;
    }

    // 3. policy (deterministic)
    const directive = decide(intent, guardrails, {
      hintLevelUnlocked: session.hintLevelUnlocked,
      hintsUsed: session.hintsUsed,
      hintPointsSpent: session.hintPointsSpent,
      integrityFlags: session.integrityFlags,
    });

    // 4. tutor (answer-blind)
    const seed = history.length * 7 + text.length;
    const first = await this.tutor.reply({ assessment, directive, history, message: text, seed });
    mock = mock || first.mock;

    // 5. judge (+ one rewrite, then safe fallback)
    const ctx = {
      referenceAnswer: assessment.referenceAnswer ?? '',
      forbiddenTerms: guardrails.forbiddenTerms ?? [],
      publicText: [assessment.problemStatement, ...(assessment.materials ?? []).map((m) => m.content)].join('\n'),
      maxAllowedHintLevel: Math.min(directive.counters.hintLevelUnlocked, maxHintLevelFor(guardrails)),
      candidateMessage: text,
    };
    let replyText = first.text;
    let judge: JudgeMeta;
    const verdict1 = await this.judge.judge(replyText, ctx);
    if (verdict1.ok) {
      judge = { verdict: 'pass', reasons: [], deterministicHits: [] };
    } else {
      const second = await this.tutor.reply({ assessment, directive, history, message: text, seed, rewriteFeedback: verdict1.reasons });
      const verdict2 = await this.judge.judge(second.text, ctx);
      const allHits = [...new Set([...verdict1.deterministicHits, ...verdict2.deterministicHits])];
      if (verdict2.ok) {
        replyText = second.text;
        judge = { verdict: 'rewritten', reasons: verdict1.reasons, deterministicHits: allHits };
      } else {
        replyText = SAFE_FALLBACK;
        judge = { verdict: 'fallback', reasons: [...new Set([...verdict1.reasons, ...verdict2.reasons])], deterministicHits: allHits };
      }
    }

    const latencyMs = Date.now() - started;
    const shared = {
      intent: directive.intent,
      decision: directive.decision,
      ...(directive.hintLevel ? { hintLevel: directive.hintLevel, hintCost: directive.hintCost } : {}),
    };
    return {
      candidateText: text,
      candidateMeta: { ...shared, mock },
      replyText,
      replyMeta: { ...shared, judge, latencyMs, mock },
      counters: directive.counters,
    };
  }
}
