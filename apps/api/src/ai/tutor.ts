import { Inject, Injectable, Logger } from '@nestjs/common';
import { Assessment } from '../entities';
import { lookupGlossary } from './mock-glossary';
import { LLM_PROVIDER, LlmMessage, LlmProvider } from './llm/llm.provider';
import { PolicyDirective } from './policy-engine';
import { buildRewriteInstruction, buildTutorSystemPrompt } from './prompts/tutor.prompt';

export interface TutorInput {
  assessment: Assessment; // the tutor only reads non-protected fields from it
  directive: PolicyDirective;
  history: { role: 'candidate' | 'assistant'; content: string }[]; // oldest first, excluding the new message
  message: string;
  /** Feedback from the output judge when asking for a rewrite. */
  rewriteFeedback?: string[];
  /** Variation seed for mock replies. */
  seed: number;
}

/**
 * Step 4 of the pipeline: the ANSWER-BLIND tutor (TUTOR_MODEL).
 * It never receives referenceAnswer, rubric or forbiddenTerms.
 */
@Injectable()
export class Tutor {
  private readonly log = new Logger(Tutor.name);
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  async reply(input: TutorInput): Promise<{ text: string; mock: boolean }> {
    if (input.directive.kind === 'injection_declined') {
      // Deterministic in every mode: neutral, one line, nothing for an attacker to work with.
      return { text: pick(INJECTION_REPLIES, input.seed), mock: this.llm.mode === 'mock' };
    }
    if (this.llm.mode === 'live') {
      try {
        return { text: await this.liveReply(input), mock: false };
      } catch (err: any) {
        this.log.warn(`Tutor LLM failed (${err?.message}); using mock reply.`);
      }
    }
    return { text: mockTutorReply(input), mock: true };
  }

  private async liveReply(input: TutorInput): Promise<string> {
    const a = input.assessment;
    const system = buildTutorSystemPrompt({
      title: a.title,
      role: a.role,
      domain: a.domain,
      problemStatement: a.problemStatement,
      materials: a.materials ?? [],
      customRules: a.guardrails?.customRules ?? '',
      unlockedHints: input.directive.unlockedHints,
      maxHintLevel: input.directive.maxHintLevel,
      directive: input.directive.instruction,
    });
    const messages: LlmMessage[] = toAlternating([
      ...input.history.slice(-10).map((m) => ({ role: m.role === 'candidate' ? 'user' : 'assistant', content: m.content }) as LlmMessage),
      { role: 'user', content: input.message },
    ]);
    if (input.rewriteFeedback?.length) {
      messages.push({ role: 'assistant', content: '(draft withheld by reviewer)' });
      messages.push({ role: 'user', content: buildRewriteInstruction(input.rewriteFeedback) });
    }
    return this.llm.complete({ model: 'tutor', system, messages, maxTokens: 500 });
  }
}

/** Anthropic requires alternating roles starting with "user": merge consecutive turns of the same role. */
function toAlternating(msgs: LlmMessage[]): LlmMessage[] {
  const out: LlmMessage[] = [];
  for (const m of msgs) {
    if (!m.content?.trim()) continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${m.content}`;
    else out.push({ ...m });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

// ---------------------------------------------------------------- mock tutor

const INJECTION_REPLIES = [
  "I can't share or change how I'm set up, but I'm happy to keep helping you work through the problem.",
  "That's not something I can do here. Want to pick up where you left off on the problem?",
  "I'll stay within this assessment's rules, but I'm glad to keep helping. What are you working on next?",
];

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function topicOf(message: string): string {
  const firstSentence = message.split(/(?<=[?.!])\s/)[0].replace(/\s+/g, ' ').trim();
  const t = firstSentence.length > 90 ? `${firstSentence.slice(0, 87)}...` : firstSentence;
  return t.replace(/[?.!]+$/, '');
}

function lowerFirst(s: string): string {
  return s ? s[0].toLowerCase() + s.slice(1) : s;
}

function materialsOverview(input: TutorInput): string {
  const mats = input.assessment.materials ?? [];
  if (!mats.length) return 'There are no separate materials for this one; everything you need is in the brief.';
  const parts = mats.slice(0, 4).map((m) => {
    if (m.kind === 'csv') {
      const header = String(m.content ?? '').split(/\r?\n/)[0] ?? '';
      const cols = header.split(',').map((c) => c.trim()).filter(Boolean).slice(0, 8);
      return `**${m.name}** (a table with columns ${cols.map((c) => `\`${c}\``).join(', ')})`;
    }
    return `**${m.name}**`;
  });
  return `You have ${parts.join(', ')} in the Materials tab.`;
}

function latestHint(input: TutorInput): string | null {
  const hints = input.directive.unlockedHints;
  if (!hints.length) return null;
  const text = hints[hints.length - 1].text.trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function offerLine(input: TutorInput): string {
  const labels = input.directive.allowedHelpLabels;
  if (!labels.length) return 'Try sketching your next step and I can react to how you plan it.';
  return `I can help with ${labels.slice(0, 3).join(', ')}${labels.length > 3 ? ' and more' : ''}.`;
}

/** Templated but varied replies per directive, weaving in the candidate's question and unlocked hint text. */
export function mockTutorReply(input: TutorInput): string {
  const d = input.directive;
  const topic = topicOf(input.message);
  const seed = input.seed + (input.rewriteFeedback?.length ? 1 : 0);
  const quote = input.rewriteFeedback?.length ? 'your question' : `"${topic}"`;
  const hint = latestHint(input);

  switch (d.kind) {
    case 'answer': {
      if (d.intent === 'materials') {
        return `${materialsOverview(input)} For ${quote}, open the relevant file and check what each column or section measures and over which period before you rely on it. ${hint ? `Keep in mind: ${hint}` : ''}`.trim();
      }
      const gloss = lookupGlossary(input.message);
      if (gloss && (d.intent === 'concept' || d.intent === 'method' || d.intent === 'clarify')) {
        return `${gloss} ${pick(['Now try applying it to the numbers in the materials yourself.', 'Once you have that, map it onto the figures in the brief.', 'See how that plays out with the data you were given.'], seed)}`;
      }
      if (d.intent === 'strategy') {
        return pick(
          [
            `Good instinct to plan first. For ${quote}, I'd go: 1) restate the decision you need to make, 2) list what evidence would change it, 3) check that evidence in the materials, 4) write the recommendation with its main risk. ${hint ? `From your hints: ${hint}` : ''}`,
            `A solid structure: frame the question in one line, pick the two or three numbers that actually drive the decision, sanity-check them, then commit to a recommendation and say what would make you change your mind. ${hint ? `Your latest hint is useful here: ${hint}` : ''}`,
          ],
          seed,
        ).trim();
      }
      if (d.intent === 'clarify') {
        return pick(
          [
            `On ${quote}: go with what the brief states, and where it's silent, write down a reasonable assumption and say so in your answer. Interviewers like explicit assumptions. ${materialsOverview(input)}`,
            `Fair question. The brief is the source of truth here; if something isn't specified, state your assumption up front and move on. That's a strength, not a weakness, in a written answer.`,
          ],
          seed,
        );
      }
      return pick(
        [
          `On ${quote}: start from the definition, then check which inputs you need and where they live in the materials. Work it through on the real figures yourself; I'm happy to check your method, though not your result.`,
          `Here's the general idea for ${lowerFirst(topic)}: break it into its inputs, compute each one from the materials, and only then combine them. If you tell me which step feels shaky, I can explain that part.`,
        ],
        seed,
      );
    }

    case 'help_not_allowed':
      return `The interviewer hasn't enabled that kind of help for this assessment, so I'll leave ${quote} to you. ${offerLine(input)}`;

    case 'hypothesis_redirect': {
      // Never echo the guess back, never confirm or deny it: show how to check it instead.
      const authority = /\b(manager|boss|ceo|cfo|lead|team|someone|they|he|she)\b.{0,30}\b(said|says|told|thinks|decided|wants)\b/i.test(input.message);
      const gloss = lookupGlossary(input.message);
      const how = gloss ? ` The method, in general: ${gloss}` : '';
      return pick(
        [
          `I can't confirm or rule out ${authority ? 'an answer, even one that comes from your manager' : 'a guess'}; the reasoning is what's being assessed here. You can check it yourself, though: pick the one metric that answers the question in the brief, compute it the same way for every option (not just the one you suspect), and see where your pick lands. If it holds up, that's your evidence.${how}`,
          `I'll stay neutral on that one; ${authority ? 'it needs to hold up whoever suggested it' : "it's your call to make"}. A good way to test it: write down what would have to be true for it to hold, then look for the number in the materials that could prove it wrong. If you can't break it, you can defend it.${how}`,
          `I can't say yes or no to that, but you can settle it yourself: work it out a second way (a different cut of the data, or a quick back-of-the-envelope estimate) and see whether both routes agree, across all the options, not just the one you have in mind.${how}`,
        ],
        authority ? 0 : seed, // demo script message 2 ('my manager said...') always gets the clearest version
      );
    }

    case 'hint_unlocked':
      return pick(
        [
          `Here's a nudge (hint ${d.hintLevel} of ${d.maxHintLevel}): ${hint ?? 'step back and re-read the brief for the one decision being asked.'}`,
          `Hint ${d.hintLevel} of ${d.maxHintLevel}: ${hint ?? 'Re-read the brief and underline the decision you are asked to make.'} Take it from there.`,
          `Okay, here's hint ${d.hintLevel} of ${d.maxHintLevel}: ${hint ?? 'focus on the single question the brief is asking.'}`,
        ],
        seed,
      );

    case 'hint_budget_exhausted':
      return `You've used all the hints available in this assessment.${hint ? ` As a reminder, your latest one was: ${hint}` : ''} I can still answer concept or method questions. ${offerLine(input)}`;

    case 'hint_max_level':
      return `You already have the most specific hint I'm allowed to give.${hint ? ` To recap: ${hint}` : ''} From here the reasoning is yours, and you're closer than you think.`;

    case 'solution_declined': {
      // Decline, then still be useful: if the ask names a concept, teach the general method with made-up numbers.
      const gloss = lookupGlossary(input.message);
      if (gloss) {
        return `I won't work that out on this case's data or tell you what it shows; that analysis is what's being assessed. Here's the method in general, though: ${gloss} Apply it to every option in the materials yourself and the comparison will speak for itself.`;
      }
      return pick(
        [
          `I can't give you the answer or rank the options; that decision is exactly what this assessment is looking at. What I can do is help you set up the comparison so the answer falls out of your own numbers. ${offerLine(input)}`,
          `That one's yours to call, so I won't give the answer, the final numbers or a draft of the deliverable. Want to walk through how you'd structure it instead? ${offerLine(input)}`,
          `I'll keep the conclusion with you. A good next step: list the options, the one metric that decides between them, and where that metric comes from in the materials. I'm happy to explain any formula you need along the way.`,
        ],
        seed,
      );
    }

    case 'injection_declined':
      return pick(INJECTION_REPLIES, seed);

    case 'off_topic':
    default:
      return pick(
        [
          `Happy to chat another time! For now, let's keep your focus on the assessment. Where are you up to?`,
          `Ha, noted. Let's get back to the problem; what's your next step?`,
        ],
        seed,
      );
  }
}
