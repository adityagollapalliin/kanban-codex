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
  return requestJson(path, schema);
}

export async function sendJson<T>(
  path: string,
  method: 'PATCH' | 'POST' | 'DELETE',
  body: unknown,
  schema: ZodType<T>,
): Promise<T> {
  return requestJson(path, schema, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function requestJson<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  const response = await fetch(path, {
    ...init,
    headers,
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
