import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';
import type { Logger } from 'pino';

const MAX_REQUEST_ID_LENGTH = 128;

export function requestContext(logger: Logger): RequestHandler {
  return (request, response, next) => {
    const suppliedId = request.headers['x-request-id'];
    const requestId =
      typeof suppliedId === 'string' &&
      suppliedId.length > 0 &&
      suppliedId.length <= MAX_REQUEST_ID_LENGTH
        ? suppliedId
        : randomUUID();
    const startedAt = performance.now();

    response.locals.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    response.once('finish', () => {
      logger.info(
        {
          durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
          method: request.method,
          path: request.path,
          requestId,
          statusCode: response.statusCode,
        },
        'request completed',
      );
    });

    next();
  };
}
