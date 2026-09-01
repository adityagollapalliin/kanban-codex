import { errorResponseSchema, type ErrorCode } from '@kanban/shared';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from 'pino';
import { ZodError, type ZodType } from 'zod';

export class ApiError extends Error {
  public constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function validateResponse<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError(
      'INTERNAL_ERROR',
      500,
      'Server produced an invalid response',
    );
  }
  return result.data;
}

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json(
    errorResponseSchema.parse({
      error: { code: 'NOT_FOUND', message: 'API route not found' },
    }),
  );
};

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }
    if (error instanceof ZodError) {
      response.status(400).json(
        errorResponseSchema.parse({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.issues,
          },
        }),
      );
      return;
    }
    if (
      error instanceof SyntaxError &&
      'status' in error &&
      error.status === 400
    ) {
      response.status(400).json(
        errorResponseSchema.parse({
          error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON body' },
        }),
      );
      return;
    }
    if (error instanceof ApiError) {
      response.status(error.status).json(
        errorResponseSchema.parse({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        }),
      );
      return;
    }
    logger.error(
      { error, requestId: response.locals.requestId },
      'request failed',
    );
    response.status(500).json(
      errorResponseSchema.parse({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      }),
    );
  };
}
