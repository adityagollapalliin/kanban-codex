import {
  checklistItemSchema,
  createChecklistItemRequestSchema,
  deletedResponseSchema,
  idParamsSchema,
  updateChecklistItemRequestSchema,
} from '@kanban/shared';
import type Database from 'better-sqlite3';
import { Router } from 'express';

import { validateResponse } from '../middleware/error-handler.js';
import {
  createChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from '../services/checklist-items.js';

export function createChecklistItemsRouter(
  database: Database.Database,
): Router {
  const router = Router();
  router.post('/', (request, response) => {
    response
      .status(201)
      .json(
        validateResponse(
          checklistItemSchema,
          createChecklistItem(
            database,
            createChecklistItemRequestSchema.parse(request.body),
          ),
        ),
      );
  });
  router.patch('/:id', (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    response.json(
      validateResponse(
        checklistItemSchema,
        updateChecklistItem(
          database,
          id,
          updateChecklistItemRequestSchema.parse(request.body),
        ),
      ),
    );
  });
  router.delete('/:id', (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    deleteChecklistItem(database, id);
    response.json(validateResponse(deletedResponseSchema, { deleted: true }));
  });
  return router;
}
