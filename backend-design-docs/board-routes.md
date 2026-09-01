# board-routes

**File:** `server/src/routes/board.ts`  
**Status:** implemented

## Purpose

Expose `GET /api/board` as the one-round-trip hydrate endpoint.

## Public interface

`createBoardRouter(database): Router`

## Data access

None directly; calls board service.

## Transaction boundaries

Owned by service.

## Validation

Validates `boardHydrateSchema` before serialization.

## Errors

| Code              | HTTP | Condition       |
| ----------------- | ---- | --------------- |
| `BOARD_NOT_FOUND` | 404  | Empty database. |

## Invariants

The route only calls, validates, and serializes.

## Failure modes

Errors flow to common middleware.

## Test cases

- Hydrate happy path and empty-board failure.
