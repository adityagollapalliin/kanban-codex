import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ConfigError, parseConfig } from '../src/config.js';

void describe('parseConfig', () => {
  void it('applies safe local defaults', () => {
    const config = parseConfig({});

    assert.equal(config.port, 3000);
    assert.equal(config.databasePath, './data/kanban.sqlite');
    assert.equal(config.nodeEnv, 'development');
    assert.equal(config.authPasswordHash, undefined);
  });

  void it('rejects an invalid port with a readable error', () => {
    assert.throws(
      () => parseConfig({ PORT: '70000' }),
      (error: unknown) =>
        error instanceof ConfigError &&
        error.message.includes('PORT') &&
        error.message.includes('65535'),
    );
  });

  void it('requires a session secret when authentication is enabled', () => {
    assert.throws(
      () => parseConfig({ AUTH_PASSWORD_HASH: 'hash' }),
      (error: unknown) =>
        error instanceof ConfigError &&
        error.message.includes('SESSION_SECRET'),
    );
  });
});
