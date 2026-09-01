# index

**File:** `server/src/index.ts`  
**Status:** implemented

## Purpose

Load configuration, migrate and own the database connection, create the app, listen for HTTP traffic, warn when authentication is disabled, and coordinate graceful shutdown.

## Public interface

Executable module; it exports no application API.

## Data access

Opens the configured SQLite database and applies pending migrations before listening. No request handler receives the connection until the API phase.

## Transaction boundaries

Not applicable.

## Validation

Delegates environment validation to `parseConfig` before opening the listener.

## Errors

| Code           | HTTP | Condition                                                          |
| -------------- | ---- | ------------------------------------------------------------------ |
| Not applicable | —    | Bootstrap failures are logged and set a failing process exit code. |

## Invariants

Only one shutdown sequence runs. SIGTERM and SIGINT stop new connections, then close SQLite before process exit.

## Failure modes

Database or migration errors fail startup before a port is opened. Listen errors close the database. A bounded shutdown timer prevents the process hanging indefinitely.

## Test cases

- Invalid or failed database startup never opens the HTTP listener.
- Signal integration is covered operationally by the development-command smoke check.
