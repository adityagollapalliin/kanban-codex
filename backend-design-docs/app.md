# app

**File:** `server/src/app.ts`  
**Status:** implemented

## Purpose

Construct the Express application and expose the unauthenticated health endpoint. Process startup and listening remain outside this module so tests can instantiate it directly.

## Public interface

`createApp(options: { logger: Logger; version: string }): Express`

## Data access

None.

## Transaction boundaries

None; the health endpoint is read-only.

## Validation

The health response is checked with the shared `healthResponseSchema` before serialization.

## Errors

| Code             | HTTP | Condition                                 |
| ---------------- | ---- | ----------------------------------------- |
| `INTERNAL_ERROR` | 500  | Unexpected middleware or handler failure. |

## Invariants

JSON responses include a request ID. Production errors never expose a stack trace.

## Failure modes

Unexpected errors are logged with their request ID and returned in the shared error envelope.

## Test cases

- Health returns `{ ok: true, version }`.
- Unknown API routes return a consistent JSON error.
