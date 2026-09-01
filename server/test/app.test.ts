import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import pino from 'pino';
import request from 'supertest';

import { createApp } from '../src/app.js';

const app = createApp({
  logger: pino({ level: 'silent' }),
  version: 'test-version',
});

void describe('application', () => {
  void it('reports health and the application version', async () => {
    const response = await request(app).get('/healthz').expect(200);

    assert.deepEqual(response.body, { ok: true, version: 'test-version' });
    const requestId = response.headers['x-request-id'];
    if (typeof requestId !== 'string')
      assert.fail('expected a request ID header');
    assert.match(requestId, /^[0-9a-f-]{36}$/);
  });

  void it('preserves a valid caller request ID', async () => {
    const response = await request(app)
      .get('/healthz')
      .set('x-request-id', 'test-request-id')
      .expect(200);

    assert.equal(response.headers['x-request-id'], 'test-request-id');
  });

  void it('returns the shared error envelope for unknown API routes', async () => {
    const response = await request(app).get('/api/missing').expect(404);

    assert.deepEqual(response.body, {
      error: { code: 'NOT_FOUND', message: 'API route not found' },
    });
  });
});
