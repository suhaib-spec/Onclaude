import { Material } from '../../common/types';

export const DRAFT_HINTS_SYSTEM = `You help an interviewer write a 4-level hint ladder for a job assessment that candidates solve with a gated AI assistant.
Hints unlock one level at a time and must NEVER contain the final answer, key result numbers or the recommendation.

Levels:
- L1 process: how to approach the problem in general (frame, plan, what a good answer contains).
- L2 where to look / hypotheses: which material, section or columns matter; which hypotheses are worth testing.
- L3 concept: the key concept, formula or method needed, explained generically.
- L4 localisation: the specific step or trap where most candidates go wrong, without giving the result.

Each hint is 1-2 sentences, addressed to the candidate ("you"). Respond with ONLY a JSON object:
{"hintLadder": [{"level": 1, "text": "..."}, {"level": 2, "text": "..."}, {"level": 3, "text": "..."}, {"level": 4, "text": "..."}]}`;

export function buildDraftHintsUserPrompt(input: {
  problemStatement: string;
  referenceAnswer: string;
  materials: Material[];
}): string {
  const materials = (input.materials ?? [])
    .map((m) => `<material name="${m.name}">\n${String(m.content ?? '').slice(0, 4000)}\n</material>`)
    .join('\n');
  return `<problem_statement>
${input.problemStatement}
</problem_statement>

<reference_answer>
${input.referenceAnswer}
</reference_answer>

${materials || '(no materials)'}

Draft the 4-level hint ladder now. Do not leak the reference answer.`;
}
