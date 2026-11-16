import { Module } from '@nestjs/common';
import { Evaluator } from './evaluation';
import { GatedAssistant } from './gated-assistant';
import { HintDrafter } from './hint-drafter';
import { InsightsService } from './insights';
import { IntentClassifier } from './intent-classifier';
import { llmProviderFactory } from './llm/llm.factory';
import { OutputJudge } from './output-judge';
import { Tutor } from './tutor';

@Module({
  providers: [llmProviderFactory, IntentClassifier, Tutor, OutputJudge, GatedAssistant, Evaluator, InsightsService, HintDrafter],
  exports: [llmProviderFactory, GatedAssistant, Evaluator, InsightsService, HintDrafter],
})
export class AiModule {}
