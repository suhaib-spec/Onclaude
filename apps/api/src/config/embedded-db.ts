import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import { REPO_ROOT } from './paths';

/**
 * Built-in database fallback (T-019).
 *
 * When no PostgreSQL server is reachable (or DB_MODE=embedded), the API starts PGlite, a Postgres build that runs
 * in-process (WebAssembly), and exposes it on a local TCP port through pglite-socket so TypeORM's normal `pg` driver
 * can talk to it. Data is persisted in `<repo>/.data/pglite`. Nothing else needs to be installed.
 */
export type DbMode = 'auto' | 'postgres' | 'embedded';

export function dbMode(): DbMode {
  const raw = (process.env.DB_MODE || 'auto').split('#')[0].trim().toLowerCase();
  return raw === 'postgres' || raw === 'embedded' ? raw : 'auto';
}

/** True when a TCP connection to the host/port in the URL succeeds within the timeout. */
export function canReach(databaseUrl: string, timeoutMs = 2000): Promise<boolean> {
  let host = 'localhost';
  let port = 5432;
  try {
    const url = new URL(databaseUrl);
    host = url.hostname || host;
    port = Number(url.port) || port;
  } catch {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

/** Starts PGlite + a socket server and returns a DATABASE_URL pointing at it. */
export async function startEmbeddedDb(log: (msg: string) => void): Promise<string> {
  // Loaded lazily so a normal Postgres setup never pays for the WebAssembly startup.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require('@electric-sql/pglite');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { uuid_ossp } = require('@electric-sql/pglite/contrib/uuid_ossp'); // TypeORM's uuid columns use uuid_generate_v4()

  const dataDir = path.resolve(REPO_ROOT, '.data', 'pglite');
  fs.mkdirSync(dataDir, { recursive: true });
  const db = await PGlite.create(dataDir, { extensions: { uuid_ossp } });

  const port = Number(process.env.EMBEDDED_DB_PORT) || 54329;
  const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1', maxConnections: 20 });
  await server.start();

  const shutdown = async () => {
    await server.stop().catch(() => undefined);
    await db.close().catch(() => undefined);
  };
  process.once('SIGINT', () => void shutdown().finally(() => process.exit(0)));
  process.once('SIGTERM', () => void shutdown().finally(() => process.exit(0)));

  log(`Built-in database (PGlite) ready on 127.0.0.1:${port}; data in ${path.relative(REPO_ROOT, dataDir)}`);
  return `postgres://postgres:postgres@127.0.0.1:${port}/postgres`;
}
