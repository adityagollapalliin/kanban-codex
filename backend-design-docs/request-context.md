# request-context

**File:** `server/src/middleware/request-context.ts`  
**Status:** implemented

## Purpose

Assign or preserve a request ID, expose it in the response, and emit one structured completion log per request.

## Public interface

`requestContext(logger: Logger): RequestHandler`

## Data access

None.

## Transaction boundaries

Not applicable.

## Validation

An incoming `x-request-id` is accepted only when it is a single, non-empty, bounded string; otherwise a UUID is generated.

## Errors

| Code           | HTTP | Condition                                 |
| -------------- | ---- | ----------------------------------------- |
| Not applicable | —    | Middleware delegates failures to Express. |

## Invariants

Every completed response carries the same request ID recorded in its log entry.

## Failure modes

Aborted requests still produce a close event log through the response lifecycle.

## Test cases

- Generated request IDs are returned.
- Valid caller request IDs are preserved.
