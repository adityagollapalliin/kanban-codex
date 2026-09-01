import pino, { type Logger } from 'pino';

import type { Config } from './config.js';

export function createLogger(environment: Config['nodeEnv']): Logger {
  return pino({
    base: { service: 'kanban-server' },
    level: environment === 'test' ? 'silent' : 'info',
  });
}
