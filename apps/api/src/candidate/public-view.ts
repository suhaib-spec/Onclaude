import { maxHintLevelFor } from '../common/types';
import { Assessment, Message, Session } from '../entities';
import { nextHintLevel } from '../ai/policy-engine';

/**
 * Candidate-facing projections. These are WHITELISTS: anything not copied here
 * (referenceAnswer, rubric, hintLadder text, forbiddenTerms, customRules, judge meta) never leaves the server.
 */
export function toTakeView(session: Session, a: Assessment) {
  const g = a.guardrails;
  return {
    session: {
      id: session.id,
      status: session.status,
      candidateName: session.candidateName,
      startedAt: session.startedAt,
      answer: session.answer,
      hintsUsed: session.hintsUsed,
      hintPointsSpent: session.hintPointsSpent,
      hintLevelUnlocked: session.hintLevelUnlocked,
    },
    assessment: {
      title: a.title,
      role: a.role,
      domain: a.domain,
      summary: a.summary,
      timeLimitMinutes: a.timeLimitMinutes,
      problemStatement: a.problemStatement,
      materials: (a.materials ?? []).map((m) => ({ id: m.id, name: m.name, kind: m.kind, content: m.content })),
      aiPolicy: {
        tier: g.tier,
        maxHintLevel: maxHintLevelFor(g),
        allowedHelp: { ...g.allowedHelp },
        hintBudget: g.hintBudget,
        hintCosts: { ...g.hintCosts },
      },
    },
  };
}

export function toPublicMessage(m: Message) {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
    meta: m.meta
      ? {
          decision: m.meta.decision,
          ...(m.meta.hintLevel ? { hintLevel: m.meta.hintLevel } : {}),
          ...(m.meta.hintLevel ? { hintCost: m.meta.hintCost ?? 0 } : {}),
        }
      : null,
  };
}

export function toBudget(session: Pick<Session, 'hintsUsed' | 'hintPointsSpent' | 'hintLevelUnlocked' | 'integrityFlags'>, a: Assessment) {
  const g = a.guardrails;
  return {
    hintsUsed: session.hintsUsed,
    hintBudget: g.hintBudget,
    hintPointsSpent: session.hintPointsSpent,
    nextHintLevel: nextHintLevel(g, session),
    maxHintLevel: maxHintLevelFor(g),
  };
}
