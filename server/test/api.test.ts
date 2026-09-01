/* Supertest exposes Response.body as any. Unsafe member/call rules are disabled only at this
 * HTTP test boundary; production routes validate every serialized response with Zod. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import type Database from 'better-sqlite3';
import pino from 'pino';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/client.js';
import { migrateDatabase } from '../src/db/migrate.js';

const TIME = '2026-01-01T00:00:00.000Z';

void describe('API', () => {
  void it('hydrates the board and reports an empty database', async () => {
    const fixture = createFixture();
    try {
      const response = await request(fixture.app).get('/api/board').expect(200);
      assert.equal(response.body.board.id, 'board');
      assert.deepEqual(
        response.body.columns.map((column: { id: string }) => column.id),
        ['column-a', 'column-b'],
      );
      assert.deepEqual(
        response.body.columns[0].cards.map((card: { id: string }) => card.id),
        ['card-a', 'card-b'],
      );
      fixture.database.prepare('DELETE FROM boards').run();
      const missing = await request(fixture.app).get('/api/board').expect(404);
      assert.equal(missing.body.error.code, 'BOARD_NOT_FOUND');
    } finally {
      fixture.cleanup();
    }
  });

  void it('creates, updates, repositions, and deletes columns with conflict protection', async () => {
    const fixture = createFixture();
    try {
      const created = await request(fixture.app)
        .post('/api/columns')
        .send({ name: 'Later', wipLimit: 2 })
        .expect(201);
      assert.equal(created.body.name, 'Later');
      const updated = await request(fixture.app)
        .patch(`/api/columns/${created.body.id}`)
        .send({
          name: 'First',
          wipLimit: null,
          prevColumnId: null,
          nextColumnId: 'column-a',
        })
        .expect(200);
      assert.equal(updated.body.wipLimit, null);
      await request(fixture.app)
        .patch(`/api/columns/${created.body.id}`)
        .send({ prevColumnId: 'missing', nextColumnId: null })
        .expect(409);
      const invalid = await request(fixture.app)
        .post('/api/columns')
        .send({ name: '' })
        .expect(400);
      assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
      await request(fixture.app).delete('/api/columns/column-a').expect(409);
      await request(fixture.app)
        .delete(`/api/columns/${created.body.id}`)
        .expect(200);
      await request(fixture.app)
        .delete('/api/columns/column-a?force=true')
        .expect(200);
      await request(fixture.app).delete('/api/columns/missing').expect(404);
    } finally {
      fixture.cleanup();
    }
  });

  void it('covers card creation, editing, moving, archiving, pagination, and deletion', async () => {
    const fixture = createFixture();
    try {
      const created = await request(fixture.app)
        .post('/api/cards')
        .send({ columnId: 'column-a', title: 'New', placement: 'top' })
        .expect(201);
      assert.equal(created.body.title, 'New');
      const patched = await request(fixture.app)
        .patch(`/api/cards/${created.body.id}`)
        .send({ title: 'Edited', dueDate: TIME, labelIds: ['label'] })
        .expect(200);
      assert.deepEqual(patched.body.labelIds, ['label']);
      const moved = await request(fixture.app)
        .post(`/api/cards/${created.body.id}/move`)
        .send({
          toColumnId: 'column-b',
          prevCardId: 'card-c',
          nextCardId: null,
        })
        .expect(200);
      assert.equal(moved.body.columnId, 'column-b');
      await request(fixture.app)
        .post(`/api/cards/${created.body.id}/move`)
        .send({
          toColumnId: 'column-a',
          prevCardId: 'card-c',
          nextCardId: null,
        })
        .expect(409);
      await request(fixture.app)
        .delete(`/api/cards/${created.body.id}`)
        .expect(409);
      await request(fixture.app)
        .patch(`/api/cards/${created.body.id}`)
        .send({ archived: true })
        .expect(200);
      const archived = await request(fixture.app)
        .get('/api/cards?archived=true&page=1&pageSize=1')
        .expect(200);
      assert.equal(archived.body.total, 1);
      assert.equal(archived.body.items.length, 1);
      await request(fixture.app)
        .delete(`/api/cards/${created.body.id}`)
        .expect(200);
      await request(fixture.app)
        .post('/api/cards')
        .send({ columnId: 'missing', title: 'No' })
        .expect(404);
      await request(fixture.app)
        .patch('/api/cards/missing')
        .send({ title: 'No' })
        .expect(404);
      await request(fixture.app).get('/api/cards').expect(400);
    } finally {
      fixture.cleanup();
    }
  });

  void it('creates, updates, and deletes checklist items with failure paths', async () => {
    const fixture = createFixture();
    try {
      const created = await request(fixture.app)
        .post('/api/checklist-items')
        .send({ cardId: 'card-a', text: 'Check' })
        .expect(201);
      assert.equal(created.body.done, false);
      const updated = await request(fixture.app)
        .patch(`/api/checklist-items/${created.body.id}`)
        .send({ text: 'Checked', done: true })
        .expect(200);
      assert.equal(updated.body.done, true);
      await request(fixture.app)
        .delete(`/api/checklist-items/${created.body.id}`)
        .expect(200);
      await request(fixture.app)
        .patch(`/api/checklist-items/${created.body.id}`)
        .send({ done: false })
        .expect(404);
      await request(fixture.app)
        .delete(`/api/checklist-items/${created.body.id}`)
        .expect(404);
      await request(fixture.app)
        .post('/api/checklist-items')
        .send({ cardId: 'missing', text: 'No' })
        .expect(404);
    } finally {
      fixture.cleanup();
    }
  });

  void it('exports, imports, and rejects an invalid graph without replacing data', async () => {
    const fixture = createFixture();
    try {
      await request(fixture.app)
        .post('/api/checklist-items')
        .send({ cardId: 'card-a', text: 'Export me' })
        .expect(201);
      const exported = await request(fixture.app)
        .get('/api/export')
        .expect(200);
      const disposition = exported.headers['content-disposition'];
      if (typeof disposition !== 'string')
        assert.fail('expected attachment header');
      assert.match(disposition, /attachment/);
      fixture.database.prepare("UPDATE boards SET name = 'Changed'").run();
      const imported = await request(fixture.app)
        .post('/api/import')
        .send(exported.body)
        .expect(200);
      assert.equal(imported.body.counts.cards, 3);
      assert.equal(
        fixture.database.prepare('SELECT name FROM boards').pluck().get(),
        'Board',
      );
      const reexported = await request(fixture.app)
        .get('/api/export')
        .expect(200);
      assert.deepEqual(reexported.body, {
        ...exported.body,
        exportedAt: reexported.body.exportedAt,
      });
      const invalidDump = structuredClone(exported.body) as {
        columns: { boardId: string }[];
      };
      const firstColumn = invalidDump.columns[0];
      if (!firstColumn) assert.fail('expected exported column');
      firstColumn.boardId = 'missing';
      await request(fixture.app)
        .post('/api/import')
        .send(invalidDump)
        .expect(400);
      assert.equal(
        fixture.database.prepare('SELECT name FROM boards').pluck().get(),
        'Board',
      );
      await request(fixture.app)
        .post('/api/import')
        .send({ version: 1 })
        .expect(400);
      const duplicateDump = structuredClone(exported.body);
      duplicateDump.cards.push(duplicateDump.cards[0]);
      await request(fixture.app)
        .post('/api/import')
        .send(duplicateDump)
        .expect(400);
    } finally {
      fixture.cleanup();
    }
  });

  void it('returns a safe 500 when export storage fails', async () => {
    const fixture = createFixture();
    try {
      fixture.database.close();
      const response = await request(fixture.app)
        .get('/api/export')
        .expect(500);
      assert.equal(response.body.error.code, 'INTERNAL_ERROR');
      assert.equal('stack' in response.body.error, false);
    } finally {
      fixture.cleanup();
    }
  });

  void it('returns a safe validation error for malformed JSON', async () => {
    const fixture = createFixture();
    try {
      const response = await request(fixture.app)
        .post('/api/cards')
        .set('content-type', 'application/json')
        .send('{')
        .expect(400);
      assert.equal(response.body.error.code, 'VALIDATION_ERROR');
      assert.equal('stack' in response.body.error, false);
    } finally {
      fixture.cleanup();
    }
  });
});

interface Fixture {
  readonly app: ReturnType<typeof createApp>;
  readonly cleanup: () => void;
  readonly database: Database.Database;
}

function createFixture(): Fixture {
  const directory = mkdtempSync(join(tmpdir(), 'kanban-api-'));
  const database = openDatabase(join(directory, 'kanban.sqlite'));
  migrateDatabase(database);
  database
    .prepare('INSERT INTO boards VALUES (?, ?, ?, ?)')
    .run('board', 'Board', TIME, TIME);
  const insertColumn = database.prepare(
    'INSERT INTO columns VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  insertColumn.run('column-a', 'board', 'A', 'a0', null, TIME, TIME);
  insertColumn.run('column-b', 'board', 'B', 'a1', null, TIME, TIME);
  const insertCard = database.prepare(
    `INSERT INTO cards (id, column_id, title, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  insertCard.run('card-a', 'column-a', 'A', 'a0', TIME, TIME);
  insertCard.run('card-b', 'column-a', 'B', 'a1', TIME, TIME);
  insertCard.run('card-c', 'column-b', 'C', 'a0', TIME, TIME);
  database
    .prepare('INSERT INTO labels VALUES (?, ?, ?, ?)')
    .run('label', 'board', 'Label', '#336699');
  const app = createApp({
    database,
    logger: pino({ level: 'silent' }),
    version: 'test',
  });
  return {
    app,
    database,
    cleanup: () => {
      if (database.open) database.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
