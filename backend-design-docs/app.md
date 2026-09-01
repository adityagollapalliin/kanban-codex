# app

**File:** `server/src/app.ts`  
**Status:** implemented

## Purpose

Construct Express, expose health, mount the complete API, and install JSON error handling. Process startup remains outside so tests instantiate it directly.

## Public interface

`createApp(options: { database: Database.Database; logger: Logger; version: string }): Express`

## Data access

Delegates database access to injected route services.

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
