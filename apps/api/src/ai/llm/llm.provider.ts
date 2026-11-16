/** One chat turn sent to a model. */
export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmRequest {
  /** Which configured model to use: the tutor (quality) or the judge (fast, cheap). */
  model: 'tutor' | 'judge';
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
}

/** Every model call goes through this interface so the pipeline can run live or in mock mode. */
export interface LlmProvider {
  readonly mode: 'live' | 'mock';
  complete(req: LlmRequest): Promise<string>;
}

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

/** Thrown by the mock provider: callers catch it (like any LLM failure) and use their deterministic fallback. */
export class MockModeError extends Error {
  constructor() {
    super('LLM is in mock mode; using the deterministic fallback.');
  }
}
