import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import argon2 from 'argon2';
import pino from 'pino';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/client.js';
import { migrateDatabase } from '../src/db/migrate.js';

void describe('authentication', () => {
  void it('rejects unauthenticated API requests and accepts a signed login session', async () => {
    const database = openDatabase(':memory:');
    migrateDatabase(database);
    const app = createApp({
      database,
      logger: pino({ enabled: false }),
      version: 'test',
      authPasswordHash: await argon2.hash('secret'),
      sessionSecret: 'a'.repeat(32),
      production: false,
    });
    try {
      assert.equal((await request(app).get('/api/board')).status, 401);
      const invalid = await request(app)
        .post('/api/auth/login')
        .send({ password: 'wrong' });
      assert.equal(invalid.status, 401);
      const login = await request(app)
        .post('/api/auth/login')
        .send({ password: 'secret' });
      assert.equal(login.status, 200);
      assert.match(String(login.headers['set-cookie']), /HttpOnly/);
      const cookie = login.headers['set-cookie'];
      assert.ok(cookie);
      assert.equal(
        (await request(app).get('/api/board').set('Cookie', cookie)).status,
        404,
      );
    } finally {
      database.close();
    }
  });
});
