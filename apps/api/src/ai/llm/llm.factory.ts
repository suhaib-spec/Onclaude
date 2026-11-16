import { config } from '../../config/env';
import { AnthropicProvider } from './anthropic.provider';
import { LLM_PROVIDER, LlmProvider } from './llm.provider';
import { MockProvider } from './mock.provider';

export function createLlmProvider(): LlmProvider {
  return config.llmMode === 'live' ? new AnthropicProvider(config.anthropicApiKey) : new MockProvider();
}

export const llmProviderFactory = { provide: LLM_PROVIDER, useFactory: createLlmProvider };
