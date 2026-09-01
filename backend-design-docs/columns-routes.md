# columns-routes

**File:** `server/src/routes/columns.ts`  
**Status:** implemented

## Purpose

Expose column create, patch, and delete endpoints.

## Public interface

`createColumnsRouter(database): Router`

## Data access

None directly.

## Transaction boundaries

Owned by services.

## Validation

Shared bodies, ID params, strict force query, and response schemas.

## Errors

| Code                                    | HTTP | Condition        |
| --------------------------------------- | ---- | ---------------- |
| `VALIDATION_ERROR`                      | 400  | Invalid request. |
| `COLUMN_NOT_FOUND`                      | 404  | Target absent.   |
| `COLUMN_NOT_EMPTY`, `NEIGHBOR_CONFLICT` | 409  | State conflict.  |

## Invariants

No SQL in routes.

## Failure modes

Thrown failures reach common middleware.

## Test cases

- Happy and failure paths for POST, PATCH, DELETE, including both 409 cases.
