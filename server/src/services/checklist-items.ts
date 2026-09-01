import {
  generatePositionBetween,
  type ChecklistItem,
  type CreateChecklistItemRequest,
  type UpdateChecklistItemRequest,
} from '@kanban/shared';
import type Database from 'better-sqlite3';
import { nanoid } from 'nanoid';

import { ApiError } from '../middleware/error-handler.js';

interface ChecklistRow {
  id: string;
  cardId: string;
  text: string;
  done: number;
  position: string;
}

export function createChecklistItem(
  database: Database.Database,
  input: CreateChecklistItemRequest,
): ChecklistItem {
  return database.transaction(() => {
    requireCard(database, input.cardId);
    const last =
      database
        .prepare<[string], string>(
          'SELECT position FROM checklist_items WHERE card_id = ? ORDER BY position DESC LIMIT 1',
        )
        .pluck()
        .get(input.cardId) ?? null;
    const id = nanoid();
    database
      .prepare(
        'INSERT INTO checklist_items (id, card_id, text, position) VALUES (?, ?, ?, ?)',
      )
      .run(id, input.cardId, input.text, generatePositionBetween(last, null));
    touchCard(database, input.cardId);
    return requireItem(database, id);
  })();
}

export function updateChecklistItem(
  database: Database.Database,
  id: string,
  input: UpdateChecklistItemRequest,
): ChecklistItem {
  return database.transaction(() => {
    const current = requireItem(database, id);
    database
      .prepare('UPDATE checklist_items SET text = ?, done = ? WHERE id = ?')
      .run(
        input.text ?? current.text,
        input.done === undefined ? (current.done ? 1 : 0) : input.done ? 1 : 0,
        id,
      );
    touchCard(database, current.cardId);
    return requireItem(database, id);
  })();
}

export function deleteChecklistItem(
  database: Database.Database,
  id: string,
): void {
  database.transaction(() => {
    const current = requireItem(database, id);
    database.prepare('DELETE FROM checklist_items WHERE id = ?').run(id);
    touchCard(database, current.cardId);
  })();
}

function requireCard(database: Database.Database, id: string): void {
  if (
    !database
      .prepare<[string], number>('SELECT 1 FROM cards WHERE id = ?')
      .pluck()
      .get(id)
  ) {
    throw new ApiError('CARD_NOT_FOUND', 404, 'Card not found');
  }
}

function requireItem(database: Database.Database, id: string): ChecklistItem {
  const row = database
    .prepare<[string], ChecklistRow>(
      'SELECT id, card_id AS cardId, text, done, position FROM checklist_items WHERE id = ?',
    )
    .get(id);
  if (!row)
    throw new ApiError(
      'CHECKLIST_ITEM_NOT_FOUND',
      404,
      'Checklist item not found',
    );
  return { ...row, done: row.done === 1 };
}

function touchCard(database: Database.Database, id: string): void {
  database
    .prepare('UPDATE cards SET updated_at = ? WHERE id = ?')
    .run(new Date().toISOString(), id);
}
