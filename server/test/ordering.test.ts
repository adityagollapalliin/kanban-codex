import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  generateEvenPositions,
  generatePositionBetween,
  isPositionStrictlyBetween,
  MAX_POSITION_LENGTH,
} from '@kanban/shared';
import type Database from 'better-sqlite3';

import { openDatabase } from '../src/db/client.js';
import { migrateDatabase } from '../src/db/migrate.js';
import {
  moveCard,
  OrderingError,
  rebalanceColumn,
} from '../src/services/ordering.js';

const INITIAL_TIMESTAMP = '2026-01-01T00:00:00.000Z';
const MOVE_TIMESTAMP = '2026-01-02T00:00:00.000Z';

void describe('fractional ordering', () => {
  void it('inserts at the head', () => {
    const first = generatePositionBetween(null, null);
    const head = generatePositionBetween(null, first);

    assert.ok(head < first);
    assert.equal(isPositionStrictlyBetween(head, null, first), true);
  });

  void it('inserts at the tail', () => {
    const first = generatePositionBetween(null, null);
    const tail = generatePositionBetween(first, null);

    assert.ok(first < tail);
    assert.equal(isPositionStrictlyBetween(tail, first, null), true);
  });

  void it('inserts in the middle', () => {
    const [first, second] = generateEvenPositions(2);
    assert.ok(first && second);
    const middle = generatePositionBetween(first, second);

    assert.equal(isPositionStrictlyBetween(middle, first, second), true);
  });

  void it('rejects reversed boundaries and invalid rebalance counts', () => {
    assert.throws(
      () => generatePositionBetween('a1', 'a0'),
      /must sort before/,
    );
    assert.throws(() => generateEvenPositions(-1), /non-negative integer/);
  });
});

void describe('ordering service', () => {
  void it('moves a card across columns between claimed neighbors', () => {
    const fixture = createFixture();
    try {
      insertCard(fixture.database, 'card-a', 'column-a', 'A', 'a0');
      insertCard(fixture.database, 'card-b', 'column-a', 'B', 'a1');
      insertCard(fixture.database, 'card-c', 'column-b', 'C', 'a0');
      insertCard(fixture.database, 'card-d', 'column-b', 'D', 'a1');

      const result = moveCard(fixture.database, {
        cardId: 'card-b',
        toColumnId: 'column-b',
        prevCardId: 'card-c',
        nextCardId: 'card-d',
        updatedAt: MOVE_TIMESTAMP,
      });

      assert.equal(result.changed, true);
      assert.equal(result.rebalanced, false);
      assert.deepEqual(cardIds(fixture.database, 'column-a'), ['card-a']);
      assert.deepEqual(cardIds(fixture.database, 'column-b'), [
        'card-c',
        'card-b',
        'card-d',
      ]);
      assert.deepEqual(cardTimestamps(fixture.database), {
        'card-a': INITIAL_TIMESTAMP,
        'card-b': MOVE_TIMESTAMP,
        'card-c': INITIAL_TIMESTAMP,
        'card-d': INITIAL_TIMESTAMP,
      });
    } finally {
      fixture.cleanup();
    }
  });

  void it('uses the current sub-gap when another card arrived between claimed neighbors', () => {
    const fixture = createFixture();
    try {
      const concurrentPosition = generatePositionBetween('a0', 'a1');
      insertCard(fixture.database, 'card-a', 'column-a', 'A', 'a0');
      insertCard(fixture.database, 'card-b', 'column-a', 'B', 'a1');
      insertCard(fixture.database, 'card-c', 'column-b', 'C', 'a0');
      insertCard(
        fixture.database,
        'card-concurrent',
        'column-b',
        'Concurrent',
        concurrentPosition,
      );
      insertCard(fixture.database, 'card-d', 'column-b', 'D', 'a1');

      moveCard(fixture.database, {
        cardId: 'card-b',
        toColumnId: 'column-b',
        prevCardId: 'card-c',
        nextCardId: 'card-d',
        updatedAt: MOVE_TIMESTAMP,
      });

      assert.deepEqual(cardIds(fixture.database, 'column-b'), [
        'card-c',
        'card-concurrent',
        'card-b',
        'card-d',
      ]);
      assert.equal(
        new Set(cardPositions(fixture.database, 'column-b')).size,
        4,
      );
    } finally {
      fixture.cleanup();
    }
  });

  void it('treats a move to the current immediate gap as a no-op', () => {
    const fixture = createFixture();
    try {
      insertCard(fixture.database, 'card-a', 'column-a', 'A', 'a0');
      insertCard(fixture.database, 'card-b', 'column-a', 'B', 'a1');
      insertCard(fixture.database, 'card-c', 'column-a', 'C', 'a2');

      const result = moveCard(fixture.database, {
        cardId: 'card-b',
        toColumnId: 'column-a',
        prevCardId: 'card-a',
        nextCardId: 'card-c',
        updatedAt: MOVE_TIMESTAMP,
      });

      assert.deepEqual(result, {
        changed: false,
        columnId: 'column-a',
        position: 'a1',
        rebalanced: false,
      });
      assert.equal(
        cardTimestamps(fixture.database)['card-b'],
        INITIAL_TIMESTAMP,
      );
    } finally {
      fixture.cleanup();
    }
  });

  void it('rejects stale, reversed, duplicate, and cross-board neighbors without writes', () => {
    const fixture = createFixture();
    try {
      insertCard(fixture.database, 'card-a', 'column-a', 'A', 'a0');
      insertCard(fixture.database, 'card-b', 'column-a', 'B', 'a1');
      insertCard(fixture.database, 'card-c', 'column-b', 'C', 'a0');
      insertCard(fixture.database, 'card-d', 'column-b', 'D', 'a1');
      fixture.database
        .prepare('INSERT INTO boards VALUES (?, ?, ?, ?)')
        .run('board-b', 'Other', INITIAL_TIMESTAMP, INITIAL_TIMESTAMP);
      fixture.database
        .prepare('INSERT INTO columns VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(
          'column-c',
          'board-b',
          'Other',
          'a0',
          null,
          INITIAL_TIMESTAMP,
          INITIAL_TIMESTAMP,
        );

      assertOrderingError(
        () =>
          moveCard(fixture.database, {
            cardId: 'card-a',
            toColumnId: 'column-b',
            prevCardId: 'card-b',
            nextCardId: null,
          }),
        'NEIGHBOR_NOT_FOUND',
      );
      assertOrderingError(
        () =>
          moveCard(fixture.database, {
            cardId: 'card-a',
            toColumnId: 'column-a',
            prevCardId: 'card-b',
            nextCardId: 'card-b',
          }),
        'INVALID_NEIGHBORS',
      );
      assertOrderingError(
        () =>
          moveCard(fixture.database, {
            cardId: 'card-a',
            toColumnId: 'column-b',
            prevCardId: 'card-d',
            nextCardId: 'card-c',
          }),
        'INVALID_NEIGHBORS',
      );
      assertOrderingError(
        () =>
          moveCard(fixture.database, {
            cardId: 'card-a',
            toColumnId: 'column-c',
            prevCardId: null,
            nextCardId: null,
          }),
        'CROSS_BOARD_MOVE',
      );
      assert.deepEqual(cardIds(fixture.database, 'column-a'), [
        'card-a',
        'card-b',
      ]);
    } finally {
      fixture.cleanup();
    }
  });

  void it('rebalances a column while preserving active-card order', () => {
    const fixture = createFixture();
    try {
      const longPosition = createLongPosition();
      insertCard(fixture.database, 'card-a', 'column-a', 'A', 'a0');
      insertCard(fixture.database, 'card-b', 'column-a', 'B', longPosition);
      insertCard(fixture.database, 'card-c', 'column-a', 'C', 'a1');
      insertCard(
        fixture.database,
        'card-archived',
        'column-a',
        'Archived',
        'a2',
        true,
      );

      const result = rebalanceColumn(
        fixture.database,
        'column-a',
        MOVE_TIMESTAMP,
      );

      assert.equal(result.count, 3);
      assert.deepEqual(cardIds(fixture.database, 'column-a'), [
        'card-a',
        'card-b',
        'card-c',
      ]);
      assert.ok(
        result.positions.every(
          (position) => position.length <= MAX_POSITION_LENGTH,
        ),
      );
      assert.equal(
        fixture.database
          .prepare<[string], string>('SELECT position FROM cards WHERE id = ?')
          .pluck()
          .get('card-archived'),
        'a2',
      );
    } finally {
      fixture.cleanup();
    }
  });

  void it('automatically rebalances after a move when any target key exceeds 40 characters', () => {
    const fixture = createFixture();
    try {
      insertCard(fixture.database, 'card-a', 'column-a', 'A', 'a0');
      insertCard(fixture.database, 'card-b', 'column-a', 'B', 'a1');
      insertCard(fixture.database, 'card-c', 'column-b', 'C', 'a0');
      insertCard(
        fixture.database,
        'card-d',
        'column-b',
        'D',
        createLongPosition(),
      );

      const result = moveCard(fixture.database, {
        cardId: 'card-b',
        toColumnId: 'column-b',
        prevCardId: 'card-d',
        nextCardId: null,
        updatedAt: MOVE_TIMESTAMP,
      });

      assert.equal(result.rebalanced, true);
      assert.deepEqual(cardIds(fixture.database, 'column-b'), [
        'card-c',
        'card-d',
        'card-b',
      ]);
      assert.ok(
        cardPositions(fixture.database, 'column-b').every(
          (position) => position.length <= MAX_POSITION_LENGTH,
        ),
      );
    } finally {
      fixture.cleanup();
    }
  });
});

interface Fixture {
  readonly cleanup: () => void;
  readonly database: Database.Database;
}

function createFixture(): Fixture {
  const directory = mkdtempSync(join(tmpdir(), 'kanban-ordering-'));
  const database = openDatabase(join(directory, 'kanban.sqlite'));
  migrateDatabase(database);
  database
    .prepare('INSERT INTO boards VALUES (?, ?, ?, ?)')
    .run('board-a', 'Board', INITIAL_TIMESTAMP, INITIAL_TIMESTAMP);
  database
    .prepare('INSERT INTO columns VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(
      'column-a',
      'board-a',
      'First',
      'a0',
      null,
      INITIAL_TIMESTAMP,
      INITIAL_TIMESTAMP,
    );
  database
    .prepare('INSERT INTO columns VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(
      'column-b',
      'board-a',
      'Second',
      'a1',
      null,
      INITIAL_TIMESTAMP,
      INITIAL_TIMESTAMP,
    );

  return {
    database,
    cleanup: () => {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

function insertCard(
  database: Database.Database,
  id: string,
  columnId: string,
  title: string,
  position: string,
  archived = false,
): void {
  database
    .prepare(
      `INSERT INTO cards
       (id, column_id, title, position, archived_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      columnId,
      title,
      position,
      archived ? INITIAL_TIMESTAMP : null,
      INITIAL_TIMESTAMP,
      INITIAL_TIMESTAMP,
    );
}

function cardIds(database: Database.Database, columnId: string): string[] {
  return database
    .prepare<[string], string>(
      `SELECT id FROM cards
       WHERE column_id = ? AND archived_at IS NULL
       ORDER BY position ASC`,
    )
    .pluck()
    .all(columnId);
}

function cardPositions(
  database: Database.Database,
  columnId: string,
): string[] {
  return database
    .prepare<[string], string>(
      `SELECT position FROM cards
       WHERE column_id = ? AND archived_at IS NULL
       ORDER BY position ASC`,
    )
    .pluck()
    .all(columnId);
}

function cardTimestamps(
  database: Database.Database,
): Readonly<Record<string, string>> {
  const rows = database
    .prepare<[], { id: string; updatedAt: string }>(
      'SELECT id, updated_at AS updatedAt FROM cards ORDER BY id',
    )
    .all();
  return Object.fromEntries(rows.map(({ id, updatedAt }) => [id, updatedAt]));
}

function createLongPosition(): string {
  let position = 'a1';
  while (position.length <= MAX_POSITION_LENGTH) {
    position = generatePositionBetween('a0', position);
  }
  return position;
}

function assertOrderingError(
  operation: () => unknown,
  code: OrderingError['code'],
): void {
  assert.throws(
    operation,
    (error: unknown) => error instanceof OrderingError && error.code === code,
  );
}
