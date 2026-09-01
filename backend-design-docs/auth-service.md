# auth-service

**File:** `server/src/services/auth.ts`  
**Status:** implemented

## Purpose

Verify the configured Argon2 password, create signed random sessions, and gate API requests.

## Public interface

`verifyPassword(hash, password)`, `createSession(database, secret)`, `requireAuth(database, secret, enabled)`, and `setSessionCookie(response, token, production)`.

## Data access

Reads and writes `sessions`; expiry is indexed.

## Transaction boundaries

Session insertion is one SQLite write; login does not mutate board data.

## Validation

Login payload is guarded by `loginRequestSchema`; signatures are HMAC-SHA256 and compared in constant time.

## Errors

| Code          | HTTP    | Condition                             |
| ------------- | ------- | ------------------------------------- |
| AUTH_REQUIRED | 401     | Missing, invalid, or expired session. |
| AUTH_INVALID  | 401/429 | Wrong password or rate limit.         |

## Invariants

Only unexpired, correctly signed session IDs authorize API requests.

## Failure modes

Invalid credentials do not create sessions; expired sessions are rejected.

## Test cases

- Password verification and signed session acceptance.
- Missing, tampered, and expired cookie rejection.
