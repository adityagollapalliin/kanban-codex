# checklist-items-routes

**File:** `server/src/routes/checklist-items.ts`  
**Status:** implemented

## Purpose

Expose checklist POST and parameterized PATCH/DELETE.

## Public interface

`createChecklistItemsRouter(database): Router`

## Data access

None directly.

## Transaction boundaries

Owned by services.

## Validation

Shared checklist bodies, params, entity, and deletion schemas.

## Errors

| Code                                         | HTTP | Condition        |
| -------------------------------------------- | ---- | ---------------- |
| `VALIDATION_ERROR`                           | 400  | Invalid request. |
| `CARD_NOT_FOUND`, `CHECKLIST_ITEM_NOT_FOUND` | 404  | Entity absent.   |

## Invariants

Routes only parse, call, validate, serialize.

## Failure modes

Common middleware handles failures.

## Test cases

- Happy and failure path for all three endpoints.
