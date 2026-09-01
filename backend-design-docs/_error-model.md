# error-model

**File:** `server/src/middleware/error-handler.ts`  
**Status:** implemented

## Purpose

Map validation, domain, parser, and unexpected failures to `{ error: { code, message, details? } }`.

## Public interface

Shared error-code union plus `ApiError`, not-found middleware, and terminal error middleware.

## Data access

None.

## Transaction boundaries

Services roll back before errors arrive.

## Validation

The shared error schema validates serialization.

## Errors

| Code                                                                             | HTTP | Condition                        |
| -------------------------------------------------------------------------------- | ---- | -------------------------------- |
| `VALIDATION_ERROR`, `IMPORT_INVALID`                                             | 400  | Invalid request or import graph. |
| `*_NOT_FOUND`                                                                    | 404  | Entity absent.                   |
| `COLUMN_NOT_EMPTY`, `CARD_NOT_ARCHIVED`, `NEIGHBOR_CONFLICT`, `CROSS_BOARD_MOVE` | 409  | State conflict.                  |
| `INTERNAL_ERROR`                                                                 | 500  | Unknown failure.                 |

## Invariants

Codes are declared, messages are safe, and stacks are never serialized.

## Failure modes

Unknown errors are request-ID logged and returned generically.

## Test cases

- 400, 404, 409, and 500 use the common envelope.
