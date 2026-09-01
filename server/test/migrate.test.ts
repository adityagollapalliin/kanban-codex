import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { openDatabase } from '../src/db/client.js';
import { migrateDatabase } from '../src/db/migrate.js';

void describe('migrateDatabase', () => {
  void it('applies the initial schema and is idempotent', () => {
    const directory = mkdtempSync(join(tmpdir(), 'kanban-migrate-'));
    const database = openDatabase(join(directory, 'kanban.sqlite'));

    try {
      assert.deepEqual(migrateDatabase(database).applied, ['001_init.sql']);
      assert.deepEqual(migrateDatabase(database).applied, []);

      const objects = database
        .prepare<[], { name: string }>(
          "SELECT name FROM sqlite_master WHERE type IN ('table', 'index')",
        )
        .all()
        .map(({ name }) => name);
      for (const name of [
        'boards',
        'columns',
        'cards',
        'labels',
        'card_labels',
        'checklist_items',
        'idx_columns_board',
        'idx_cards_column',
        'idx_cards_archived',
      ]) {
        assert.ok(objects.includes(name), `expected ${name} to exist`);
      }
      assert.equal(database.pragma('foreign_keys', { simple: true }), 1);
    } finally {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });

  void it('cascades board deletion through columns and cards', () => {
    const directory = mkdtempSync(join(tmpdir(), 'kanban-cascade-'));
    const database = openDatabase(join(directory, 'kanban.sqlite'));

    try {
      migrateDatabase(database);
      const timestamp = new Date().toISOString();
      database
        .prepare('INSERT INTO boards VALUES (?, ?, ?, ?)')
        .run('board', 'Board', timestamp, timestamp);
      database
        .prepare('INSERT INTO columns VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run('column', 'board', 'Column', 'a0', null, timestamp, timestamp);
      database
        .prepare(
          'INSERT INTO cards (id, column_id, title, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .run('card', 'column', 'Card', 'a0', timestamp, timestamp);

      database.prepare('DELETE FROM boards WHERE id = ?').run('board');
      assert.equal(
        database.prepare('SELECT count(*) AS count FROM cards').pluck().get(),
        0,
      );
    } finally {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });

  void it('rolls back a failing migration without losing earlier migrations', () => {
    const directory = createMigrationDirectory({
      '001_good.sql': 'CREATE TABLE stable (id TEXT PRIMARY KEY);',
      '002_bad.sql': 'CREATE TABLE doomed (id TEXT); INVALID SQL;',
    });
    const database = openDatabase(':memory:');

    try {
      assert.throws(() => migrateDatabase(database, directory), /syntax error/);
      assert.equal(
        database.prepare('SELECT count(*) FROM _migrations').pluck().get(),
        1,
      );
      assert.equal(
        database
          .prepare(
            "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'doomed'",
          )
          .pluck()
          .get(),
        0,
      );
    } finally {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });

  void it('rejects gaps and duplicate migration numbers', () => {
    for (const files of [
      {
        '001_first.sql': 'SELECT 1;',
        '003_third.sql': 'SELECT 3;',
      },
      {
        '001_first.sql': 'SELECT 1;',
        '001_other.sql': 'SELECT 2;',
      },
    ]) {
      const directory = createMigrationDirectory(files);
      const database = openDatabase(':memory:');
      try {
        assert.throws(() => migrateDatabase(database, directory), /contiguous/);
      } finally {
        database.close();
        rmSync(directory, { recursive: true, force: true });
      }
    }
  });

  void it('rejects changed and missing applied migrations', () => {
    const directory = createMigrationDirectory({
      '001_first.sql': 'CREATE TABLE first_table (id TEXT);',
    });
    const database = openDatabase(':memory:');

    try {
      migrateDatabase(database, directory);
      writeFileSync(join(directory, '001_first.sql'), 'SELECT 2;');
      assert.throws(() => migrateDatabase(database, directory), /has changed/);

      rmSync(join(directory, '001_first.sql'));
      assert.throws(
        () => migrateDatabase(database, directory),
        /missing from disk/,
      );
    } finally {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

function createMigrationDirectory(
  files: Readonly<Record<string, string>>,
): string {
  const directory = mkdtempSync(join(tmpdir(), 'kanban-migrations-'));
  for (const [filename, sql] of Object.entries(files)) {
    writeFileSync(join(directory, filename), sql);
  }
  return directory;
}
