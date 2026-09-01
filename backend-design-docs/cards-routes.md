# cards-routes

**File:** `server/src/routes/cards.ts`  
**Status:** implemented

## Purpose

Expose card create, patch, move, archive-list, and hard-delete endpoints.

## Public interface

`createCardsRouter(database): Router`

## Data access

None directly.

## Transaction boundaries

Owned by services.

## Validation

Shared bodies, query, params, entities, and page schemas.

## Errors

| Code                                                         | HTTP | Condition                 |
| ------------------------------------------------------------ | ---- | ------------------------- |
| `VALIDATION_ERROR`                                           | 400  | Invalid request.          |
| `*_NOT_FOUND`                                                | 404  | Referenced entity absent. |
| `CARD_NOT_ARCHIVED`, `NEIGHBOR_CONFLICT`, `CROSS_BOARD_MOVE` | 409  | State conflict.           |

## Invariants

Moves receive neighbour IDs, never client positions.

## Failure modes

Errors pass to common middleware.

## Test cases

- Happy and failure path per endpoint, including stale-neighbour 409.
