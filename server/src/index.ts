import process from 'node:process';

import { createApp } from './app.js';
import { ConfigError, parseConfig } from './config.js';
import { openDatabase } from './db/client.js';
import { migrateDatabase } from './db/migrate.js';
import { createLogger } from './logger.js';

try {
  process.loadEnvFile();
} catch (error: unknown) {
  if (!isMissingFileError(error)) {
    throw error;
  }
}

try {
  const config = parseConfig(process.env);
  const logger = createLogger(config.nodeEnv);
  const database = openDatabase(config.databasePath);
  let migrations;
  try {
    migrations = migrateDatabase(database);
  } catch (error: unknown) {
    database.close();
    throw error;
  }
  logger.info({ applied: migrations.applied }, 'database migrations completed');
  const version = process.env.npm_package_version ?? '0.1.0';
  const app = createApp({ logger, version });
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port, version }, 'server listening');
    if (!config.authPasswordHash) {
      logger.warn(
        'AUTH_PASSWORD_HASH is unset; authentication is disabled and the application is open',
      );
    }
  });

  let shuttingDown = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'graceful shutdown started');

    const timeout = setTimeout(() => {
      logger.error('graceful shutdown timed out');
      process.exitCode = 1;
      server.closeAllConnections();
    }, 10_000);
    timeout.unref();

    server.close((error) => {
      clearTimeout(timeout);
      if (database.open) database.close();
      if (error) {
        logger.error({ error }, 'HTTP server failed to close cleanly');
        process.exitCode = 1;
      } else {
        logger.info('graceful shutdown completed');
      }
    });
  };

  server.once('error', (error) => {
    logger.error({ error }, 'HTTP server failed');
    process.exitCode = 1;
    if (database.open) database.close();
  });

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
} catch (error: unknown) {
  const message =
    error instanceof ConfigError ? error.message : 'Server failed to start';
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function isMissingFileError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as Error & { code?: unknown }).code === 'ENOENT'
  );
}
