import { Inject, Injectable, Logger } from '@nestjs/common';
import { HintStep, Material } from '../common/types';
import { parseJsonObject } from './json';
import { LLM_PROVIDER, LlmProvider } from './llm/llm.provider';
import { buildDraftHintsUserPrompt, DRAFT_HINTS_SYSTEM } from './prompts/draft-hints.prompt';
import { deterministicCheck } from './output-judge';

/** "Draft hints with AI" for the assessment builder. Mock returns generic process hints. */
@Injectable()
export class HintDrafter {
  private readonly log = new Logger(HintDrafter.name);
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  async draft(input: { problemStatement: string; referenceAnswer: string; materials: Material[] }): Promise<HintStep[]> {
    if (this.llm.mode === 'live') {
      try {
        const raw = await this.llm.complete({
          model: 'tutor',
          system: DRAFT_HINTS_SYSTEM,
          messages: [{ role: 'user', content: buildDraftHintsUserPrompt(input) }],
          maxTokens: 700,
        });
        const parsed = parseJsonObject<{ hintLadder: HintStep[] }>(raw);
        const ladder = (parsed?.hintLadder ?? [])
          .filter((h) => [1, 2, 3, 4].includes(Number(h?.level)) && String(h?.text ?? '').trim())
          .map((h) => ({ level: Number(h.level) as HintStep['level'], text: String(h.text).trim() }));
        const publicText = [input.problemStatement, ...(input.materials ?? []).map((m) => m.content)].join('\n');
        const leaky = ladder.some((h) => deterministicCheck(h.text, { referenceAnswer: input.referenceAnswer, forbiddenTerms: [], publicText, maxAllowedHintLevel: 4, candidateMessage: '' }).length);
        if (ladder.length === 4 && !leaky) return ladder;
        this.log.warn('Drafted hints were incomplete or leaked numbers; using generic hints.');
      } catch (err: any) {
        this.log.warn(`Hint drafting LLM failed (${err?.message}); using generic hints.`);
      }
    }
    return genericHints(input.materials ?? []);
  }
}

function genericHints(materials: Material[]): HintStep[] {
  const mat = materials.length ? `the materials (${materials.map((m) => m.name).slice(0, 3).join(', ')})` : 'the brief';
  return [
    { level: 1, text: 'Restate the decision you are being asked to make in one sentence, then list the two or three factors that would change it.' },
    { level: 2, text: `Look closely at ${mat}: identify which figures or sections directly bear on that decision and note anything that looks inconsistent.` },
    { level: 3, text: 'Pick the core concept or method that connects those figures to the decision, and apply it consistently to every option you compare.' },
    { level: 4, text: 'Before you conclude, check the step most people rush: compare like with like (same base, same period, same segment) and sanity-check the direction of your result.' },
  ];
}
