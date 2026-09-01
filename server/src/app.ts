import { errorResponseSchema, healthResponseSchema } from '@kanban/shared';
import express, { type ErrorRequestHandler, type Express } from 'express';
import type { Logger } from 'pino';

import { requestContext } from './middleware/request-context.js';

interface AppOptions {
  readonly logger: Logger;
  readonly version: string;
}

export function createApp({ logger, version }: AppOptions): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestContext(logger));
  app.use(express.json());

  app.get('/healthz', (_request, response) => {
    response.json(healthResponseSchema.parse({ ok: true, version }));
  });

  app.use('/api', (_request, response) => {
    response.status(404).json(
      errorResponseSchema.parse({
        error: { code: 'NOT_FOUND', message: 'API route not found' },
      }),
    );
  });

  const handleError: ErrorRequestHandler = (
    error,
    _request,
    response,
    _next,
  ) => {
    const requestId: unknown = response.locals.requestId;
    logger.error({ error, requestId }, 'request failed');
    response.status(500).json(
      errorResponseSchema.parse({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      }),
    );
  };
  app.use(handleError);

  return app;
}
