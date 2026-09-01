import { errorResponseSchema, type ErrorResponse } from '@kanban/shared';
import type { ZodType } from 'zod';

export class ApiClientError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly response?: ErrorResponse,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function getJson<T>(path: string, schema: ZodType<T>): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: 'application/json' },
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const parsed = errorResponseSchema.safeParse(body);
    throw new ApiClientError(
      parsed.success
        ? parsed.data.error.message
        : `Request failed with status ${String(response.status)}`,
      response.status,
      parsed.success ? parsed.data : undefined,
    );
  }
  return schema.parse(body);
}
