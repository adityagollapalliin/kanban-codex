import { healthResponseSchema } from '@kanban/shared';
import type Database from 'better-sqlite3';
import express, { type Express } from 'express';
import type { Logger } from 'pino';

import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestContext } from './middleware/request-context.js';
import { createBoardRouter } from './routes/board.js';
import { createCardsRouter } from './routes/cards.js';
import { createChecklistItemsRouter } from './routes/checklist-items.js';
import { createColumnsRouter } from './routes/columns.js';
import { createExportImportRouter } from './routes/export-import.js';
import { createAuthRouter } from './routes/auth.js';
import { requireAuth } from './services/auth.js';

interface AppOptions {
  readonly database: Database.Database;
  readonly logger: Logger;
  readonly version: string;
  readonly authPasswordHash?: string;
  readonly sessionSecret?: string;
  readonly production?: boolean;
  readonly staticRoot?: string;
}

export function createApp({
  database,
  logger,
  version,
  authPasswordHash,
  sessionSecret,
  production = false,
  staticRoot,
}: AppOptions): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestContext(logger));
  app.use(express.json({ limit: '10mb' }));

  app.get('/healthz', (_request, response) => {
    response.json(healthResponseSchema.parse({ ok: true, version }));
  });

  if (authPasswordHash && sessionSecret) {
    app.use(
      '/api/auth',
      createAuthRouter(database, authPasswordHash, sessionSecret, production),
    );
    app.use('/api', requireAuth(database, sessionSecret, true));
  }

  app.use('/api/board', createBoardRouter(database));
  app.use('/api/columns', createColumnsRouter(database));
  app.use('/api/cards', createCardsRouter(database));
  app.use('/api/checklist-items', createChecklistItemsRouter(database));
  app.use('/api', createExportImportRouter(database));
  app.use('/api', notFoundHandler);
  if (production && staticRoot) {
    app.use(
      express.static(staticRoot, {
        setHeaders: (response, filePath) => {
          if (/[/\\]assets[/\\]/.test(filePath)) {
            response.setHeader(
              'Cache-Control',
              'public, max-age=31536000, immutable',
            );
          }
        },
      }),
    );
    app.get('/{*splat}', (_request, response) => {
      response.sendFile('index.html', { root: staticRoot });
    });
  }
  app.use(errorHandler(logger));

  return app;
}
