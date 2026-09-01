import { exportDumpSchema, importResultSchema } from '@kanban/shared';
import type Database from 'better-sqlite3';
import { Router } from 'express';

import { validateResponse } from '../middleware/error-handler.js';
import { exportDatabase, importDatabase } from '../services/export-import.js';

export function createExportImportRouter(database: Database.Database): Router {
  const router = Router();
  router.get('/export', (_request, response) => {
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="kanban-export.json"',
    );
    response.json(validateResponse(exportDumpSchema, exportDatabase(database)));
  });
  router.post('/import', (request, response) => {
    response.json(
      validateResponse(
        importResultSchema,
        importDatabase(database, exportDumpSchema.parse(request.body)),
      ),
    );
  });
  return router;
}
