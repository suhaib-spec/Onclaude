import { Controller, Get, Inject } from '@nestjs/common';
import { LLM_PROVIDER, LlmProvider } from '../ai/llm/llm.provider';

@Controller('health')
export class HealthController {
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  @Get()
  health() {
    return { ok: true, llmMode: this.llm.mode };
  }
}
