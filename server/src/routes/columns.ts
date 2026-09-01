import {
  columnSchema,
  createColumnRequestSchema,
  deleteColumnQuerySchema,
  deletedResponseSchema,
  idParamsSchema,
  updateColumnRequestSchema,
} from '@kanban/shared';
import type Database from 'better-sqlite3';
import { Router } from 'express';

import { validateResponse } from '../middleware/error-handler.js';
import {
  createColumn,
  deleteColumn,
  updateColumn,
} from '../services/columns.js';

export function createColumnsRouter(database: Database.Database): Router {
  const router = Router();
  router.post('/', (request, response) => {
    const result = createColumn(
      database,
      createColumnRequestSchema.parse(request.body),
    );
    response.status(201).json(validateResponse(columnSchema, result));
  });
  router.patch('/:id', (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    response.json(
      validateResponse(
        columnSchema,
        updateColumn(
          database,
          id,
          updateColumnRequestSchema.parse(request.body),
        ),
      ),
    );
  });
  router.delete('/:id', (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const query = deleteColumnQuerySchema.parse(request.query);
    deleteColumn(database, id, query.force === 'true');
    response.json(validateResponse(deletedResponseSchema, { deleted: true }));
  });
  return router;
}
