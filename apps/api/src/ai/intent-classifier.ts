import { Inject, Injectable, Logger } from '@nestjs/common';
import { INTENTS, Intent } from '../common/types';
import { parseJsonObject } from './json';
import { LLM_PROVIDER, LlmProvider } from './llm/llm.provider';
import { buildClassifierUserPrompt, CLASSIFIER_SYSTEM, ClassifierOutput } from './prompts/classifier.prompt';

export interface ClassifierInput {
  title: string;
  message: string;
  recent: { role: string; content: string }[]; // last ~6 messages, oldest first
}

/** Step 2 of the pipeline: classify the candidate's intent (JUDGE_MODEL, JSON), with keyword rules as fallback. */
@Injectable()
export class IntentClassifier {
  private readonly log = new Logger(IntentClassifier.name);
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  async classify(input: ClassifierInput): Promise<{ intent: Intent; mock: boolean }> {
    // Obvious injections are caught deterministically even in live mode.
    const ruled = classifyByRules(input.message, input.recent);
    if (ruled === 'injection' || this.llm.mode === 'mock') return { intent: ruled, mock: this.llm.mode === 'mock' };
    try {
      const raw = await this.llm.complete({
        model: 'judge',
        system: CLASSIFIER_SYSTEM,
        messages: [{ role: 'user', content: buildClassifierUserPrompt(input.title, input.recent, input.message) }],
        maxTokens: 150,
      });
      const parsed = parseJsonObject<ClassifierOutput>(raw);
      if (parsed && INTENTS.includes(parsed.intent)) return { intent: parsed.intent, mock: false };
      this.log.warn(`Unparseable classifier output; using rules. Output: ${raw.slice(0, 120)}`);
    } catch (err: any) {
      this.log.warn(`Classifier LLM failed (${err?.message}); using rules.`);
    }
    return { intent: ruled, mock: true };
  }
}

const RULES: [Intent, RegExp][] = [
  [
    'injection',
    /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(previous|prior|above|all|your|the)\b.{0,30}\b(instructions?|rules?|prompt|guardrails?|policy|restrictions?)\b|\b(system prompt|developer mode|jailbreak|dan mode|reference answer|hidden (instructions?|rules?|answer)|rubric|forbidden terms?|your (instructions|rules|prompt))\b|\b(pretend|act as|you are now|roleplay as|role-play as)\b.{0,40}\b(interviewer|admin|developer|unrestricted|no (rules|limits))\b/i,
  ],
  [
    'solution_request',
    /\b(just|simply)\s+(tell|give|show)\b|\b(give|tell|show|send|share|write)\s+(me\s+)?(the\s+)?(final\s+|full\s+|correct\s+|right\s+)?(answer|solution|result|recommendation|number|conclusion)s?\b|\bwhat(?:'s| is) the (final |correct |right )?(answer|solution|recommendation|result)\b|\b(solve|do|write|finish|complete)\s+(it|this|the (problem|task|answer|whole thing))\s+(for me)?\b|\bwrite (my|the) (answer|deliverable|memo|report)\b|\bwhich (option|price|variant|one) should i (pick|choose|recommend)\b/i,
  ],
  [
    'hypothesis_check',
    /\b(is it|is the answer|am i (right|correct|on the right track)|is (this|that|my \w+) (right|correct)|correct\?|right\?|does that (look|sound) right|did i get it|should it be|so the answer is|i think (it'?s|the answer)|is \S+ the (answer|winner|best))\b/i,
  ],
  [
    'hypothesis_check',
    /^(so |then |ok so )?(is|was|are|does|did|would|will)\b.{0,60}\b(winner|best|better|worse|answer|right|correct|significant|the one|wins?|beats?)\b|\bmy (answer|conclusion|recommendation) is\b/i,
  ],
  ['hint_request', /\b(hint|nudge|clue|i'?m stuck|i am stuck|stuck|help me get unstuck|point me)\b/i],
  ['materials', /\b(column|columns|row|rows|csv|table|sheet|material|materials|file|dataset|data dictionary|appendix|exhibit|section|where (is|can i find)|which file)\b/i],
  ['concept', /\b(what (is|are|does)|what's|meaning of|define|definition|explain|difference between|concept)\b/i],
  ['method', /\b(how (do|can|should|would) (i|you|we) (calculate|compute|measure|test|estimate|model|derive|find|work out|use)|formula|how to (calculate|compute|test|measure)|method|technique|step[- ]by[- ]step way to)\b/i],
  ['strategy', /\b(where (should|do) i start|how should i (approach|structure|plan|start)|approach|plan|prioriti[sz]e|next step|what should i (focus|consider|look at)|framework)\b/i],
  ['clarify', /\b(clarify|scope|assum(e|ption)|constraint|deliverable|format|expected|requirement|does .{0,30} mean|are we allowed|do i need to|time limit|deadline|what exactly)\b/i],
];

/** Deterministic keyword classifier (mock mode and LLM fallback). Exported for unit tests. */
export function classifyByRules(message: string, recent: { role: string; content: string }[] = []): Intent {
  const text = message.toLowerCase();
  for (const [intent, re] of RULES) {
    if (re.test(text)) return intent;
  }
  // Piecemeal extraction: several narrow "what is the X for Y" number questions in a row.
  const recentCandidate = recent.filter((m) => m.role === 'candidate').slice(-3);
  const numberAsks = [...recentCandidate.map((m) => m.content), message].filter((t) =>
    /\b(what('?s| is) the (exact |final )?(value|number|rate|figure|total|percentage|revenue|profit|lift))\b/i.test(t),
  );
  if (numberAsks.length >= 3) return 'solution_request';
  if (/\?\s*$/.test(text) || /^(how|what|why|which|when|where|can|could|should|is|are|do|does)\b/.test(text)) {
    return 'clarify';
  }
  if (text.length < 25 && /\b(hi|hello|hey|thanks|thank you|lol|weather|joke)\b/.test(text)) return 'off_topic';
  return 'strategy';
}
