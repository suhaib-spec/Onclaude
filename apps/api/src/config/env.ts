import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { REPO_ROOT } from './paths';

/** Loads `.env` from the repo root first, then from the current working directory (first value wins). */
export function loadEnv(): string[] {
  const candidates = [path.resolve(REPO_ROOT, '.env'), path.resolve(process.cwd(), '.env')];
  const loaded: string[] = [];
  for (const file of [...new Set(candidates)]) {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file, quiet: true } as dotenv.DotenvConfigOptions);
      loaded.push(file);
    }
  }
  return loaded;
}

export type LlmMode = 'live' | 'mock';

export const config = {
  get databaseUrl(): string {
    return process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/interview_trainer';
  },
  get port(): number {
    return Number(process.env.PORT) || 3000;
  },
  get anthropicApiKey(): string {
    return (process.env.ANTHROPIC_API_KEY || '').trim();
  },
  get tutorModel(): string {
    return process.env.TUTOR_MODEL || 'claude-sonnet-5-5';
  },
  get judgeModel(): string {
    return process.env.JUDGE_MODEL || 'claude-haiku-5-5';
  },
  /** auto = live when a key is present, else mock. `live` without a key still falls back to mock. */
  get llmMode(): LlmMode {
    const requested = (process.env.LLM_MODE || 'auto').split('#')[0].trim().toLowerCase();
    if (requested === 'mock') return 'mock';
    return this.anthropicApiKey ? 'live' : 'mock';
  },
};
