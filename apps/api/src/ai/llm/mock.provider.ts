import { LlmProvider, MockModeError } from './llm.provider';

/**
 * Mock provider used when no ANTHROPIC_API_KEY is set (or LLM_MODE=mock).
 * It never produces text: every component has its own deterministic mock logic and falls back to it.
 */
export class MockProvider implements LlmProvider {
  readonly mode = 'mock' as const;
  async complete(): Promise<string> {
    throw new MockModeError();
  }
}
