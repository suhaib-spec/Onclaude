import { Client } from 'pg';

/**
 * Creates the database named in DATABASE_URL if it does not exist yet, by connecting to the
 * `postgres` maintenance database. Never throws: on failure it logs and lets TypeORM report the real error.
 */
export async function ensureDatabase(databaseUrl: string, log: (msg: string) => void): Promise<void> {
  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    log(`DATABASE_URL is not a valid URL; skipping database auto-create.`);
    return;
  }
  const dbName = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!dbName || dbName === 'postgres') return;

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  const client = new Client({ connectionString: adminUrl.toString() });
  try {
    await client.connect();
    const found = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (found.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      log(`Created database "${dbName}".`);
    }
  } catch (err: any) {
    if (err?.code !== '42P04') log(`Could not auto-create database "${dbName}": ${err?.message ?? err}`);
  } finally {
    await client.end().catch(() => undefined);
  }
}
