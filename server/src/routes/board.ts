import { boardHydrateSchema } from '@kanban/shared';
import type Database from 'better-sqlite3';
import { Router } from 'express';

import { validateResponse } from '../middleware/error-handler.js';
import { getBoard } from '../services/board.js';

export function createBoardRouter(database: Database.Database): Router {
  const router = Router();
  router.get('/', (_request, response) =>
    response.json(validateResponse(boardHydrateSchema, getBoard(database))),
  );
  return router;
}
