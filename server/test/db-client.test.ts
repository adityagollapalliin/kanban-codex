import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { openDatabase } from '../src/db/client.js';

void describe('openDatabase', () => {
  void it('creates parent directories and enables durable file settings', () => {
    const directory = mkdtempSync(join(tmpdir(), 'kanban-client-'));
    const databasePath = join(directory, 'nested', 'kanban.sqlite');
    const database = openDatabase(databasePath);

    try {
      assert.equal(database.pragma('journal_mode', { simple: true }), 'wal');
      assert.equal(database.pragma('foreign_keys', { simple: true }), 1);
      assert.equal(database.pragma('busy_timeout', { simple: true }), 5_000);
    } finally {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });

  void it('opens an in-memory database and enforces foreign keys', () => {
    const database = openDatabase(':memory:');

    try {
      database.exec(`
        CREATE TABLE parents (id TEXT PRIMARY KEY);
        CREATE TABLE children (parent_id TEXT REFERENCES parents(id));
      `);
      assert.throws(() => {
        database
          .prepare('INSERT INTO children (parent_id) VALUES (?)')
          .run('missing');
      }, /FOREIGN KEY constraint failed/);
    } finally {
      database.close();
    }
  });
});
