import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config, loadEnv } from './config/env';
import { canReach, dbMode, startEmbeddedDb } from './config/embedded-db';
import { ensureDatabase } from './config/ensure-database';

async function bootstrap() {
  const log = new Logger('Hintwise');
  const envFiles = loadEnv(); // must run before AppModule reads config
  log.log(envFiles.length ? `Loaded env from ${envFiles.join(', ')}` : 'No .env found; using defaults (copy .env.example to .env at the repo root).');

  const mode = dbMode();
  const usePostgres = mode === 'postgres' || (mode === 'auto' && (await canReach(config.databaseUrl)));
  if (usePostgres) {
    await ensureDatabase(config.databaseUrl, (m) => log.log(m));
  } else {
    log.log(
      mode === 'embedded'
        ? 'DB_MODE=embedded: starting the built-in database.'
        : 'No PostgreSQL server reachable at DATABASE_URL: starting the built-in database instead.',
    );
    process.env.DATABASE_URL = await startEmbeddedDb((m) => log.log(m));
  }

  const { AppModule } = await import('./app.module');
  const { SeederService } = await import('./demo-data/seeder.service');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: ['http://localhost:4200', 'http://127.0.0.1:4200'] });
  app.useBodyParser('json', { limit: '5mb' });
  app.enableShutdownHooks();
  await app.listen(config.port);

  const seed = app.get(SeederService).lastResult;
  const seeded = seed.skipped
    ? `0 assessments seeded (${seed.existing} already in DB; POST /api/demo/reset to reseed)`
    : `${seed.assessments} assessment(s) + ${seed.sessions} demo session(s) seeded`;
  log.log(
    `Ready on http://localhost:${config.port}/api | LLM: ${config.llmMode} | DB: connected | ${seeded} | ` +
      `Demo: http://localhost:4200/take/PRICING1  http://localhost:4200/take/ABTEST01`,
  );
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Hintwise API failed to start:', err?.message ?? err);
  process.exit(1);
});
