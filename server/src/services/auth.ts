import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import argon2 from 'argon2';
import type Database from 'better-sqlite3';
import type { RequestHandler } from 'express';
import { ApiError } from '../middleware/error-handler.js';

const COOKIE = 'kanban_session';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function createSession(
  database: Database.Database,
  secret: string,
): string {
  const id = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + MAX_AGE_MS).toISOString();
  database
    .prepare(
      'INSERT INTO sessions (id, expires_at, created_at) VALUES (?, ?, ?)',
    )
    .run(id, expires, new Date().toISOString());
  return `${id}.${sign(id, secret)}`;
}

export function requireAuth(
  database: Database.Database,
  secret: string | undefined,
  enabled: boolean,
): RequestHandler {
  return (request, _response, next) => {
    if (!enabled) {
      next();
      return;
    }
    const raw = request.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1);
    const [id, signature] = raw?.split('.') ?? [];
    if (
      !secret ||
      !id ||
      !signature ||
      !safeCompare(signature, sign(id, secret))
    ) {
      next(new ApiError('AUTH_REQUIRED', 401, 'Authentication required'));
      return;
    }
    const valid = database
      .prepare<[string, string], string>(
        'SELECT id FROM sessions WHERE id = ? AND expires_at > ?',
      )
      .get(id, new Date().toISOString());
    if (!valid) {
      next(new ApiError('AUTH_REQUIRED', 401, 'Authentication required'));
      return;
    }
    next();
  };
}

export function setSessionCookie(
  response: { setHeader(name: string, value: string): void },
  token: string,
  production: boolean,
): void {
  response.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${String(MAX_AGE_MS / 1000)}${production ? '; Secure' : ''}`,
  );
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}
function safeCompare(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
