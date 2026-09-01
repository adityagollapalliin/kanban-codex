# config

**File:** `server/src/config.ts`  
**Status:** implemented

## Purpose

Convert environment strings into a typed, immutable runtime configuration and fail early with readable validation messages.

## Public interface

`parseConfig(environment: NodeJS.ProcessEnv): Config`

## Data access

Reads process environment only; it does not access files or tables.

## Transaction boundaries

Not applicable.

## Validation

Zod validates `PORT`, `DATABASE_PATH`, `AUTH_PASSWORD_HASH`, `SESSION_SECRET`, and `NODE_ENV`. A session secret is required when authentication is enabled.

## Errors

| Code           | HTTP | Condition                                                             |
| -------------- | ---- | --------------------------------------------------------------------- |
| Not applicable | —    | Invalid configuration throws `ConfigError` before the server listens. |

## Invariants

The port is an integer from 1–65535 and production mode is explicit.

## Failure modes

Invalid input produces a concise list of field-level issues and exits startup without accepting traffic.

## Test cases

- Defaults are applied to optional values.
- Invalid ports are rejected readably.
- Enabling auth without a session secret is rejected.
