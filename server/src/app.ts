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

interface AppOptions {
  readonly database: Database.Database;
  readonly logger: Logger;
  readonly version: string;
}

export function createApp({ database, logger, version }: AppOptions): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestContext(logger));
  app.use(express.json({ limit: '10mb' }));

  app.get('/healthz', (_request, response) => {
    response.json(healthResponseSchema.parse({ ok: true, version }));
  });

  app.use('/api/board', createBoardRouter(database));
  app.use('/api/columns', createColumnsRouter(database));
  app.use('/api/cards', createCardsRouter(database));
  app.use('/api/checklist-items', createChecklistItemsRouter(database));
  app.use('/api', createExportImportRouter(database));
  app.use('/api', notFoundHandler);
  app.use(errorHandler(logger));

  return app;
}
