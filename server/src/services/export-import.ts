import {
  exportDumpSchema,
  type ExportDump,
  type ImportResult,
} from '@kanban/shared';
import type Database from 'better-sqlite3';

import { ApiError } from '../middleware/error-handler.js';

export function exportDatabase(database: Database.Database): ExportDump {
  return database.transaction(() =>
    exportDumpSchema.parse({
      version: 1,
      exportedAt: new Date().toISOString(),
      boards: database
        .prepare(
          `SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM boards ORDER BY id`,
        )
        .all(),
      columns: database
        .prepare(
          `SELECT id, board_id AS boardId, name, position, wip_limit AS wipLimit, created_at AS createdAt, updated_at AS updatedAt FROM columns ORDER BY board_id, position`,
        )
        .all(),
      cards: database
        .prepare(
          `SELECT id, column_id AS columnId, title, description, position, due_date AS dueDate, archived_at AS archivedAt, created_at AS createdAt, updated_at AS updatedAt FROM cards ORDER BY column_id, position`,
        )
        .all(),
      labels: database
        .prepare(
          `SELECT id, board_id AS boardId, name, color FROM labels ORDER BY board_id, id`,
        )
        .all(),
      cardLabels: database
        .prepare(
          `SELECT card_id AS cardId, label_id AS labelId FROM card_labels ORDER BY card_id, label_id`,
        )
        .all(),
      checklistItems: database
        .prepare(
          `SELECT id, card_id AS cardId, text, done, position FROM checklist_items ORDER BY card_id, position`,
        )
        .all()
        .map((row) => {
          const item = row as {
            id: string;
            cardId: string;
            text: string;
            done: number;
            position: string;
          };
          return { ...item, done: item.done === 1 };
        }),
    }),
  )();
}

export function importDatabase(
  database: Database.Database,
  dump: ExportDump,
): ImportResult {
  validateGraph(dump);
  return database.transaction((): ImportResult => {
    database.prepare('DELETE FROM boards').run();
    const boardInsert = database.prepare(
      'INSERT INTO boards (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
    );
    for (const row of dump.boards)
      boardInsert.run(row.id, row.name, row.createdAt, row.updatedAt);
    const columnInsert = database.prepare(
      `INSERT INTO columns (id, board_id, name, position, wip_limit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const row of dump.columns)
      columnInsert.run(
        row.id,
        row.boardId,
        row.name,
        row.position,
        row.wipLimit,
        row.createdAt,
        row.updatedAt,
      );
    const cardInsert = database.prepare(
      `INSERT INTO cards (id, column_id, title, description, position, due_date, archived_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const row of dump.cards)
      cardInsert.run(
        row.id,
        row.columnId,
        row.title,
        row.description,
        row.position,
        row.dueDate,
        row.archivedAt,
        row.createdAt,
        row.updatedAt,
      );
    const labelInsert = database.prepare(
      'INSERT INTO labels (id, board_id, name, color) VALUES (?, ?, ?, ?)',
    );
    for (const row of dump.labels)
      labelInsert.run(row.id, row.boardId, row.name, row.color);
    const cardLabelInsert = database.prepare(
      'INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)',
    );
    for (const row of dump.cardLabels)
      cardLabelInsert.run(row.cardId, row.labelId);
    const checklistInsert = database.prepare(
      'INSERT INTO checklist_items (id, card_id, text, done, position) VALUES (?, ?, ?, ?, ?)',
    );
    for (const row of dump.checklistItems)
      checklistInsert.run(
        row.id,
        row.cardId,
        row.text,
        row.done ? 1 : 0,
        row.position,
      );
    return {
      imported: true,
      counts: {
        boards: dump.boards.length,
        columns: dump.columns.length,
        cards: dump.cards.length,
        labels: dump.labels.length,
        cardLabels: dump.cardLabels.length,
        checklistItems: dump.checklistItems.length,
      },
    };
  })();
}

function validateGraph(dump: ExportDump): void {
  const boards = new Set(dump.boards.map((row) => row.id));
  const columns = new Set(dump.columns.map((row) => row.id));
  const cards = new Set(dump.cards.map((row) => row.id));
  const labels = new Set(dump.labels.map((row) => row.id));
  const invalid =
    hasDuplicates(dump.boards.map((row) => row.id)) ||
    hasDuplicates(dump.columns.map((row) => row.id)) ||
    hasDuplicates(dump.cards.map((row) => row.id)) ||
    hasDuplicates(dump.labels.map((row) => row.id)) ||
    hasDuplicates(dump.checklistItems.map((row) => row.id)) ||
    hasDuplicates(
      dump.cardLabels.map((row) => `${row.cardId}\u0000${row.labelId}`),
    ) ||
    dump.columns.some((row) => !boards.has(row.boardId)) ||
    dump.cards.some((row) => !columns.has(row.columnId)) ||
    dump.labels.some((row) => !boards.has(row.boardId)) ||
    dump.cardLabels.some(
      (row) => !cards.has(row.cardId) || !labels.has(row.labelId),
    ) ||
    dump.checklistItems.some((row) => !cards.has(row.cardId));
  if (invalid)
    throw new ApiError(
      'IMPORT_INVALID',
      400,
      'Import contains invalid references',
    );
}

function hasDuplicates(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}
