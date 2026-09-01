# auth-routes

**File:** `server/src/routes/auth.ts`  
**Status:** implemented

## Purpose

Expose the rate-limited password login endpoint; all other API routes are gated by auth middleware.

## Public interface

`POST /api/auth/login` accepts `{ password }` and returns `{ authenticated: true }` with a signed httpOnly cookie.

## Data access

Delegates session creation to auth service.

## Transaction boundaries

One session insert per successful login.

## Validation

Zod login request and response schemas.

## Errors

`AUTH_INVALID` 401 for wrong credentials; `AUTH_INVALID` 429 after five attempts per IP per fifteen minutes.

## Invariants

Failed attempts never create sessions.

## Failure modes

Malformed bodies are validation errors; Argon2 failures are handled by the standard error envelope.

## Test cases

- Successful login cookie.
- Invalid password.
- Rate limit.
