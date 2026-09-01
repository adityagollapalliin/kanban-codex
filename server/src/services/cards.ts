import {
  generatePositionBetween,
  type Card,
  type CreateCardRequest,
  type MoveCardRequest,
  type UpdateCardRequest,
} from '@kanban/shared';
import type Database from 'better-sqlite3';
import { nanoid } from 'nanoid';

import { ApiError } from '../middleware/error-handler.js';
import { moveCard, OrderingError, rebalanceColumn } from './ordering.js';

type CardRow = Omit<Card, 'labelIds' | 'checklistItems'>;
interface ChecklistRow {
  id: string;
  cardId: string;
  text: string;
  done: number;
  position: string;
}

export function getCard(database: Database.Database, id: string): Card {
  const row = database
    .prepare<[string], CardRow>(
      `SELECT id, column_id AS columnId, title, description, position, due_date AS dueDate,
            archived_at AS archivedAt, created_at AS createdAt, updated_at AS updatedAt
     FROM cards WHERE id = ?`,
    )
    .get(id);
  if (!row) throw new ApiError('CARD_NOT_FOUND', 404, 'Card not found');
  const labelIds = database
    .prepare<[string], string>(
      'SELECT label_id FROM card_labels WHERE card_id = ? ORDER BY label_id',
    )
    .pluck()
    .all(id);
  const checklistItems = database
    .prepare<[string], ChecklistRow>(
      `SELECT id, card_id AS cardId, text, done, position
     FROM checklist_items WHERE card_id = ? ORDER BY position`,
    )
    .all(id)
    .map((item) => ({ ...item, done: item.done === 1 }));
  return { ...row, labelIds, checklistItems };
}

export function createCard(
  database: Database.Database,
  input: CreateCardRequest,
): Card {
  return database.transaction(() => {
    requireColumn(database, input.columnId);
    const edge =
      database
        .prepare<[string], string>(
          `SELECT position FROM cards WHERE column_id = ? AND archived_at IS NULL
       ORDER BY position ${input.placement === 'top' ? 'ASC' : 'DESC'} LIMIT 1`,
        )
        .pluck()
        .get(input.columnId) ?? null;
    const position =
      input.placement === 'top'
        ? generatePositionBetween(null, edge)
        : generatePositionBetween(edge, null);
    const timestamp = new Date().toISOString();
    const id = nanoid();
    database
      .prepare(
        `INSERT INTO cards (id, column_id, title, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(id, input.columnId, input.title, position, timestamp, timestamp);
    const longest =
      database
        .prepare<[string], number>(
          'SELECT max(length(position)) FROM cards WHERE column_id = ? AND archived_at IS NULL',
        )
        .pluck()
        .get(input.columnId) ?? 0;
    if (longest > 40) rebalanceColumn(database, input.columnId, timestamp);
    return getCard(database, id);
  })();
}

export function updateCard(
  database: Database.Database,
  id: string,
  input: UpdateCardRequest,
): Card {
  return database.transaction(() => {
    const current = getCard(database, id);
    const timestamp = new Date().toISOString();
    if (input.labelIds)
      validateLabels(database, current.columnId, input.labelIds);
    const archivedAt =
      input.archived === undefined
        ? current.archivedAt
        : input.archived
          ? (current.archivedAt ?? timestamp)
          : null;
    database
      .prepare(
        `UPDATE cards SET title = ?, description = ?, due_date = ?, archived_at = ?, updated_at = ?
       WHERE id = ?`,
      )
      .run(
        input.title ?? current.title,
        input.description ?? current.description,
        'dueDate' in input ? input.dueDate : current.dueDate,
        archivedAt,
        timestamp,
        id,
      );
    if (input.labelIds) {
      database.prepare('DELETE FROM card_labels WHERE card_id = ?').run(id);
      const insert = database.prepare(
        'INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)',
      );
      for (const labelId of new Set(input.labelIds)) insert.run(id, labelId);
    }
    return getCard(database, id);
  })();
}

export function moveCardByNeighbors(
  database: Database.Database,
  id: string,
  input: MoveCardRequest,
): Card {
  try {
    moveCard(database, { cardId: id, ...input });
    return getCard(database, id);
  } catch (error: unknown) {
    if (!(error instanceof OrderingError)) throw error;
    if (error.code === 'CARD_NOT_FOUND')
      throw new ApiError('CARD_NOT_FOUND', 404, error.message);
    if (error.code === 'COLUMN_NOT_FOUND')
      throw new ApiError('COLUMN_NOT_FOUND', 404, error.message);
    if (error.code === 'CROSS_BOARD_MOVE')
      throw new ApiError('CROSS_BOARD_MOVE', 409, error.message);
    throw new ApiError('NEIGHBOR_CONFLICT', 409, error.message);
  }
}

export function deleteArchivedCard(
  database: Database.Database,
  id: string,
): void {
  database.transaction(() => {
    const card = getCard(database, id);
    if (!card.archivedAt) {
      throw new ApiError(
        'CARD_NOT_ARCHIVED',
        409,
        'Only archived cards can be permanently deleted',
      );
    }
    database.prepare('DELETE FROM cards WHERE id = ?').run(id);
  })();
}

export function listArchivedCards(
  database: Database.Database,
  page: number,
  pageSize: number,
): { items: Card[]; page: number; pageSize: number; total: number } {
  const total =
    database
      .prepare<[], number>(
        'SELECT count(*) FROM cards WHERE archived_at IS NOT NULL',
      )
      .pluck()
      .get() ?? 0;
  const ids = database
    .prepare<[number, number], string>(
      `SELECT id FROM cards WHERE archived_at IS NOT NULL
     ORDER BY archived_at DESC, id ASC LIMIT ? OFFSET ?`,
    )
    .pluck()
    .all(pageSize, (page - 1) * pageSize);
  return {
    items: ids.map((id) => getCard(database, id)),
    page,
    pageSize,
    total,
  };
}

function requireColumn(database: Database.Database, id: string): void {
  if (
    !database
      .prepare<[string], number>('SELECT 1 FROM columns WHERE id = ?')
      .pluck()
      .get(id)
  ) {
    throw new ApiError('COLUMN_NOT_FOUND', 404, 'Column not found');
  }
}

function validateLabels(
  database: Database.Database,
  columnId: string,
  labelIds: readonly string[],
): void {
  const boardId = database
    .prepare<[string], string>('SELECT board_id FROM columns WHERE id = ?')
    .pluck()
    .get(columnId);
  const valid = new Set(
    database
      .prepare<[string], string>('SELECT id FROM labels WHERE board_id = ?')
      .pluck()
      .all(boardId ?? ''),
  );
  if (labelIds.some((id) => !valid.has(id))) {
    throw new ApiError(
      'LABEL_NOT_FOUND',
      404,
      'One or more labels were not found on this board',
    );
  }
}
