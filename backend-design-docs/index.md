# index

**File:** `server/src/index.ts`  
**Status:** implemented

## Purpose

Load configuration, create the app, listen for HTTP traffic, warn when authentication is disabled, and coordinate graceful shutdown.

## Public interface

Executable module; it exports no application API.

## Data access

None in Phase 1. Database ownership is added in the data-layer phase.

## Transaction boundaries

Not applicable.

## Validation

Delegates environment validation to `parseConfig` before opening the listener.

## Errors

| Code           | HTTP | Condition                                                          |
| -------------- | ---- | ------------------------------------------------------------------ |
| Not applicable | —    | Bootstrap failures are logged and set a failing process exit code. |

## Invariants

Only one shutdown sequence runs. SIGTERM and SIGINT stop new connections before process exit.

## Failure modes

Listen errors fail startup. A bounded shutdown timer prevents the process hanging indefinitely.

## Test cases

- Covered indirectly by application and configuration tests; signal integration is deferred until the database lifecycle exists.
