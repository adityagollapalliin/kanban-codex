import {
  archivedCardsPageSchema,
  archivedCardsQuerySchema,
  cardSchema,
  createCardRequestSchema,
  deletedResponseSchema,
  idParamsSchema,
  moveCardRequestSchema,
  updateCardRequestSchema,
} from '@kanban/shared';
import type Database from 'better-sqlite3';
import { Router } from 'express';

import { validateResponse } from '../middleware/error-handler.js';
import {
  createCard,
  deleteArchivedCard,
  listArchivedCards,
  moveCardByNeighbors,
  updateCard,
} from '../services/cards.js';

export function createCardsRouter(database: Database.Database): Router {
  const router = Router();
  router.get('/', (request, response) => {
    const query = archivedCardsQuerySchema.parse(request.query);
    response.json(
      validateResponse(
        archivedCardsPageSchema,
        listArchivedCards(database, query.page, query.pageSize),
      ),
    );
  });
  router.post('/', (request, response) => {
    response
      .status(201)
      .json(
        validateResponse(
          cardSchema,
          createCard(database, createCardRequestSchema.parse(request.body)),
        ),
      );
  });
  router.patch('/:id', (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    response.json(
      validateResponse(
        cardSchema,
        updateCard(database, id, updateCardRequestSchema.parse(request.body)),
      ),
    );
  });
  router.post('/:id/move', (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    response.json(
      validateResponse(
        cardSchema,
        moveCardByNeighbors(
          database,
          id,
          moveCardRequestSchema.parse(request.body),
        ),
      ),
    );
  });
  router.delete('/:id', (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    deleteArchivedCard(database, id);
    response.json(validateResponse(deletedResponseSchema, { deleted: true }));
  });
  return router;
}
