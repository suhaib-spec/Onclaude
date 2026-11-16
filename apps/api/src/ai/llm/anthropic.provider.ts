import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/env';
import { LlmProvider, LlmRequest } from './llm.provider';

/** Live provider backed by Anthropic Claude. Models come from TUTOR_MODEL / JUDGE_MODEL. */
export class AnthropicProvider implements LlmProvider {
  readonly mode = 'live' as const;
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, timeout: 45_000, maxRetries: 1 });
  }

  async complete(req: LlmRequest): Promise<string> {
    const model = req.model === 'tutor' ? config.tutorModel : config.judgeModel;
    const res = await this.client.messages.create({
      model,
      max_tokens: req.maxTokens ?? 800,
      system: req.system,
      messages: req.messages,
    });
    const text = res.content
      .map((block: any) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();
    if (!text) throw new Error('Empty response from model');
    return text;
  }
}
