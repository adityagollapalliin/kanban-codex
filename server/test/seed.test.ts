import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { openDatabase } from '../src/db/client.js';
import { migrateDatabase } from '../src/db/migrate.js';
import { seedDatabase } from '../src/seed.js';

void describe('seedDatabase', () => {
  void it('creates one demo board with three columns and eight cards exactly once', () => {
    const directory = mkdtempSync(join(tmpdir(), 'kanban-seed-'));
    const database = openDatabase(join(directory, 'kanban.sqlite'));

    try {
      migrateDatabase(database);
      const first = seedDatabase(database);
      const second = seedDatabase(database);

      assert.equal(first.seeded, true);
      assert.equal(typeof first.boardId, 'string');
      assert.deepEqual(second, { seeded: false });
      assert.equal(
        database.prepare('SELECT count(*) FROM boards').pluck().get(),
        1,
      );
      assert.equal(
        database.prepare('SELECT count(*) FROM columns').pluck().get(),
        3,
      );
      assert.equal(
        database.prepare('SELECT count(*) FROM cards').pluck().get(),
        8,
      );
    } finally {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
