import * as fs from 'fs';
import * as path from 'path';

/**
 * Finds the repository root by walking up from this file until a folder containing `apps/api` is found.
 * Works from `src/` (ts-jest), from `dist/` (compiled) and on Windows, because it only uses path.resolve.
 */
function findRepoRoot(): string {
  let dir = path.resolve(__dirname);
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.resolve(dir, 'apps', 'api'))) return dir;
    const parent = path.resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  // Fallbacks: started from apps/api or from the repo root.
  const cwd = process.cwd();
  if (fs.existsSync(path.resolve(cwd, 'apps', 'api'))) return cwd;
  return path.resolve(cwd, '..', '..');
}

export const REPO_ROOT = findRepoRoot();
export const DEMO_DIR = path.resolve(REPO_ROOT, 'demo');
