# logger

**File:** `server/src/logger.ts`  
**Status:** implemented

## Purpose

Create the Pino logger used by bootstrap and HTTP middleware with stable service metadata.

## Public interface

`createLogger(environment: Config['nodeEnv']): Logger`

## Data access

Writes newline-delimited JSON to standard output.

## Transaction boundaries

Not applicable.

## Validation

The typed configuration restricts environment values before logger creation.

## Errors

| Code           | HTTP | Condition                                                   |
| -------------- | ---- | ----------------------------------------------------------- |
| Not applicable | —    | Stream failures are handled by Pino/Node process semantics. |

## Invariants

Logs are structured JSON and server code does not use `console.log`.

## Failure modes

Output backpressure is managed by Pino's destination stream.

## Test cases

- No dedicated test; behaviour is exercised through request logging.
