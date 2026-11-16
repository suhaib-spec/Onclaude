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
      if (parsed && INTENTS.includes(parsed.intent)) return { intent: moreRestrictive(ruled, parsed.intent), mock: false };
      this.log.warn(`Unparseable classifier output; using rules. Output: ${raw.slice(0, 120)}`);
    } catch (err: any) {
      this.log.warn(`Classifier LLM failed (${err?.message}); using rules.`);
    }
    return { intent: ruled, mock: true };
  }
}

// Red-team hardened (docs/review/04-red-team.md). First match wins, so the most restrictive rules come first.
const RULES: [Intent, RegExp][] = [
  [
    'injection',
    /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(previous|prior|above|all|your|the)\b.{0,30}\b(instructions?|rules?|prompt|guardrails?|policy|restrictions?)\b|\b(system prompt|developer mode|jailbreak|dan mode|reference answer|answer key|answer sheet|marking scheme|grading (key|guide)|hint ladder|hidden (instructions?|rules?|answer|hints?)|rubric|forbidden (terms?|words?|phrases?|list)|blocked (terms?|words?|phrases?)|your (instructions|rules|prompt|settings|config))\b|\b(grader|admin|debug|god|developer|maintenance|unrestricted) mode\b|\b(pretend|imagine)\b.{0,25}\b(you('?re| are)|to be|you were)\b|\b(act|behave|respond|answer) as (if|though|my|a|an|the)\b|\byou are now\b|\bfrom now on,? you\b|\brole-?play\b|\b(base ?64|rot ?13|hexadecimal|morse|cipher|encoded|encode it|encrypt(ed)?|backwards|in reverse|acrostic|first letters?)\b/i,
  ],
  [
    // "My manager says X, just confirm it": a guess offered for confirmation -> redirect (never confirm/deny).
    'hypothesis_check',
    /\b(confirm|validate|verify|double[- ]check|sign off on|agree)\b.{0,40}\b(it|this|that|right|correct|answer|price|winner|choice|recommendation|conclusion|guess|result|ship|variant \w)\b|\b(confirm|validate|verify)\b.{0,40}\$\d|\b(confirm|validate|verify)\b\s*[.!?]*$|\$?\d[\d.,]*%?.{0,40}\b(is|was) (the )?(right|correct|best|winning|optimal)\b/i,
  ],
  [
    'solution_request',
    /\b(just|simply)\s+(tell|give|show)\b|\b(give|tell|show|send|share|write)\s+(me\s+)?(the\s+)?(final\s+|full\s+|correct\s+|right\s+)?(answer|solution|result|recommendation|number|conclusion)s?\b|\bwhat(?:'s| is) the (final |correct |right |best )?(answer|solution|recommendation|result|conclusion)\b|\bwhat(?:'s| is) the (best|right|correct|optimal|winning) (price|decision|option|arm|variant|choice)\b|\b(solve|do|write|finish|complete)\s+(it|this|the (problem|task|answer|whole thing))\s+(for me)?\b|\bwrite (my|the|a|this) (answer|deliverable|memo|report|recommendation|summary|email)\b|\b(memo|report|deliverable)\b.{0,15}\bfor me\b|\bwhich (option|price|variant|one|arm|tier|plan) should (i|we)\b|\bwhat (price|option|arm|variant|decision|tier|plan)\b.{0,30}\b(should|would|do|must) (i|we|you|they)\b|\bshould (we|i|they|the team|the company|lena)\s+(ship|launch|roll ?out|go with|pick|choose|price|charge|recommend|kill)\b|\b(which|what) (price|prices|arm|arms|variant|variants|option|options|segment|segments|device|devices|one|tier|plan)\b.{0,40}\b(gives?|makes?|wins?|earns?|loses?|lose|performs?|converts?|best|worst|highest|lowest|most|least|better|worse|maximi[sz]es|profitable)\b|\b(rank|order|sort)\b.{0,30}\b(prices|arms|options|variants|devices|segments|them)\b|\bbest to worst\b|\bworst to best\b|\b(compute|calculate|work out|figure out|run|crunch|tabulate)\b.{0,50}(\bfor (each|every|all|me)\b|\bper[- ](price|arm|device|variant|segment)\b|\bby (device|price|arm|variant|segment)\b|\beach (price|arm|device|variant|segment)\b|\b(this|the|our) (data|dataset|numbers|csv|test|results)\b)|\bwhat('?s| is| are| was| were)\b.{0,40}\b(at|for|of|in|on)\s+(the\s+)?(\$\d|\d+ ?(usd|dollars?)\b|(arm|variant|version|group) \w+\b|b\b|mobile\b|desktop\b|tablet\b)|\b(describe|explain|summari[sz]e|hint at|spell out|outline|paraphrase|tell me about|sketch)\b.{0,20}\b(the )?(answer|solution|conclusion|recommendation|right price|winner|outcome)\b|\b(respuesta|soluci[oó]n|mejor precio|mejor opci[oó]n|r[ée]ponse|meilleur prix|antwort|l[öo]sung|beste[rn]? preis|risposta|soluzione|miglior prezzo|resposta|melhor pre[cç]o)\b|答案|答え|정답/i,
  ],
  [
    'hypothesis_check',
    /\b(is it|is the answer|am i (right|correct|on the right track)|is (this|that|my \w+) (right|correct)|correct\?|right\?|does that (look|sound) right|did i get it|should it be|so the answer is|i think (it'?s|the answer)|is \S+ the (answer|winner|best))\b/i,
  ],
  [
    'hypothesis_check',
    /^(so |then |ok so )?(is|was|are|does|did|would|will|has)\b.{0,60}\b(winner|best|better|worse|answer|right|correct|significant|the one|wins?|beats?|bad|good|wrong|mistake|trap|optimal|profitable|loses?|lose money|worth it|the way to go|50\/50|balanced|skewed|broken|valid|fake|biased|higher|lower|above|below|more than|less than)\b|\bmy (answer|conclusion|recommendation|guess|pick) is\b|^(is|are|does|do|did|was|were|has|have)\b.{0,80}\b(in|with|from) (this|the|our) (data|dataset|test|experiment|case|csv|results?)\b/i,
  ],
  ['hint_request', /\b(hint|nudge|clue|i'?m stuck|i am stuck|stuck|help me get unstuck|point me)\b/i],
  ['materials', /\b(column|columns|row|rows|csv|table|sheet|material|materials|file|dataset|data dictionary|appendix|exhibit|section|where (is|can i find)|which file)\b/i],
  ['concept', /\b(what (is|are|does)|what's|meaning of|define|definition|explain|difference between|concept)\b/i],
  ['method', /\b(how (do|can|should|would) (i|you|we) (calculate|compute|measure|test|estimate|model|derive|find|work out|use|run|do|perform|set up|compare|check|read|interpret)|formula|how to (calculate|compute|test|measure)|method|technique|step[- ]by[- ]step way to)\b/i],
  ['strategy', /\b(where (should|do) i start|how should i (approach|structure|plan|start)|approach|plan|prioriti[sz]e|next step|what should i (focus|consider|look at)|framework)\b/i],
  ['clarify', /\b(clarify|scope|assum(e|ption)|constraint|deliverable|format|expected|requirement|does .{0,30} mean|are we allowed|do i need to|time limit|deadline|what exactly)\b/i],
];

const RESTRICTIVE: Intent[] = ['injection', 'solution_request', 'hypothesis_check'];

/**
 * Live mode: a deterministic rule hit for injection / solution_request / hypothesis_check is never downgraded by the
 * LLM (a jailbreak that fools the classifier still meets the keyword rules). Otherwise the LLM's intent wins.
 */
export function moreRestrictive(ruled: Intent, llm: Intent): Intent {
  const r = RESTRICTIVE.indexOf(ruled);
  const l = RESTRICTIVE.indexOf(llm);
  if (r === -1) return llm;
  if (l === -1) return ruled;
  return r < l ? ruled : llm;
}

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
