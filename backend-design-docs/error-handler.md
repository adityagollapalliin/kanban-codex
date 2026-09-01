# error-handler

**File:** `server/src/middleware/error-handler.ts`  
**Status:** implemented

## Purpose

Implement safe Express serialization for the shared error model.

## Public interface

`ApiError`; `validateResponse`; `notFoundHandler`; `errorHandler(logger)`.

## Data access

None.

## Transaction boundaries

Not applicable.

## Validation

Recognizes Zod and JSON-parser failures and parses emitted envelopes.

## Errors

| Code                  | HTTP | Condition        |
| --------------------- | ---- | ---------------- |
| See `_error-model.md` | —    | Central mapping. |

## Invariants

One safe response, with unknown errors request-ID logged and no stacks serialized.

## Failure modes

Headers-sent failures delegate to Express.

## Test cases

- Covered by route validation, domain, unknown route, and unexpected-error tests.
