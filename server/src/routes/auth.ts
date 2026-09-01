import { loginRequestSchema, loginResponseSchema } from '@kanban/shared';
import type Database from 'better-sqlite3';
import { Router } from 'express';
import { ApiError, validateResponse } from '../middleware/error-handler.js';
import {
  createSession,
  setSessionCookie,
  verifyPassword,
} from '../services/auth.js';

export function createAuthRouter(
  database: Database.Database,
  passwordHash: string,
  secret: string,
  production: boolean,
): Router {
  const router = Router();
  const attempts = new Map<string, number[]>();
  router.post('/login', async (request, response) => {
    const ip = request.ip ?? 'unknown';
    const now = Date.now();
    const recent = (attempts.get(ip) ?? []).filter(
      (time) => now - time < 15 * 60 * 1000,
    );
    if (recent.length >= 5)
      throw new ApiError('AUTH_INVALID', 429, 'Too many login attempts');
    recent.push(now);
    attempts.set(ip, recent);
    const { password } = loginRequestSchema.parse(request.body);
    if (!(await verifyPassword(passwordHash, password)))
      throw new ApiError('AUTH_INVALID', 401, 'Invalid password');
    const token = createSession(database, secret);
    setSessionCookie(response, token, production);
    response.json(
      validateResponse(loginResponseSchema, { authenticated: true }),
    );
  });
  return router;
}
