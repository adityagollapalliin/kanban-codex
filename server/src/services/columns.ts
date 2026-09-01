import {
  generatePositionBetween,
  type Column,
  type CreateColumnRequest,
  type UpdateColumnRequest,
} from '@kanban/shared';
import type Database from 'better-sqlite3';
import { nanoid } from 'nanoid';

import { ApiError } from '../middleware/error-handler.js';

type ColumnRow = Column;

export function createColumn(
  database: Database.Database,
  input: CreateColumnRequest,
): Column {
  return database.transaction(() => {
    const boardId = database
      .prepare<[], string>('SELECT id FROM boards LIMIT 1')
      .pluck()
      .get();
    if (!boardId) throw new ApiError('BOARD_NOT_FOUND', 404, 'Board not found');
    const last =
      database
        .prepare<[string], string>(
          'SELECT position FROM columns WHERE board_id = ? ORDER BY position DESC LIMIT 1',
        )
        .pluck()
        .get(boardId) ?? null;
    const timestamp = new Date().toISOString();
    const id = nanoid();
    database
      .prepare(
        `INSERT INTO columns (id, board_id, name, position, wip_limit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        boardId,
        input.name,
        generatePositionBetween(last, null),
        input.wipLimit ?? null,
        timestamp,
        timestamp,
      );
    return requireColumn(database, id);
  })();
}

export function updateColumn(
  database: Database.Database,
  id: string,
  input: UpdateColumnRequest,
): Column {
  return database.transaction(() => {
    const current = requireColumn(database, id);
    let position = current.position;
    if ('prevColumnId' in input && 'nextColumnId' in input) {
      position = derivePosition(
        database,
        current,
        input.prevColumnId ?? null,
        input.nextColumnId ?? null,
      );
    }
    database
      .prepare(
        `UPDATE columns SET name = ?, wip_limit = ?, position = ?, updated_at = ? WHERE id = ?`,
      )
      .run(
        input.name ?? current.name,
        'wipLimit' in input ? input.wipLimit : current.wipLimit,
        position,
        new Date().toISOString(),
        id,
      );
    return requireColumn(database, id);
  })();
}

export function deleteColumn(
  database: Database.Database,
  id: string,
  force: boolean,
): void {
  database.transaction(() => {
    requireColumn(database, id);
    const count =
      database
        .prepare<[string], number>(
          'SELECT count(*) FROM cards WHERE column_id = ?',
        )
        .pluck()
        .get(id) ?? 0;
    if (count > 0 && !force) {
      throw new ApiError(
        'COLUMN_NOT_EMPTY',
        409,
        'Column must be empty before deletion',
      );
    }
    database.prepare('DELETE FROM columns WHERE id = ?').run(id);
  })();
}

function requireColumn(database: Database.Database, id: string): ColumnRow {
  const row = database
    .prepare<[string], ColumnRow>(
      `SELECT id, board_id AS boardId, name, position, wip_limit AS wipLimit,
            created_at AS createdAt, updated_at AS updatedAt FROM columns WHERE id = ?`,
    )
    .get(id);
  if (!row) throw new ApiError('COLUMN_NOT_FOUND', 404, 'Column not found');
  return row;
}

function derivePosition(
  database: Database.Database,
  current: ColumnRow,
  previousId: string | null,
  nextId: string | null,
): string {
  if (previousId !== null && previousId === nextId) conflict();
  const siblings = database
    .prepare<[string, string], ColumnRow>(
      `SELECT id, board_id AS boardId, name, position, wip_limit AS wipLimit,
            created_at AS createdAt, updated_at AS updatedAt
     FROM columns WHERE board_id = ? AND id != ? ORDER BY position`,
    )
    .all(current.boardId, current.id);
  const previous =
    previousId === null
      ? null
      : (siblings.find((row) => row.id === previousId) ?? null);
  const next =
    nextId === null
      ? null
      : (siblings.find((row) => row.id === nextId) ?? null);
  if ((previousId !== null && !previous) || (nextId !== null && !next))
    conflict();
  if (siblings.length > 0 && !previous && !next) conflict();
  if (previous && next && previous.position >= next.position) conflict();

  if (next === null)
    return generatePositionBetween(siblings.at(-1)?.position ?? null, null);
  if (previous === null)
    return generatePositionBetween(
      null,
      siblings[0]?.position ?? next.position,
    );
  const nextIndex = siblings.findIndex((row) => row.id === next.id);
  return generatePositionBetween(
    siblings[nextIndex - 1]?.position ?? previous.position,
    next.position,
  );
}

function conflict(): never {
  throw new ApiError(
    'NEIGHBOR_CONFLICT',
    409,
    'Column neighbors are stale or invalid',
  );
}
