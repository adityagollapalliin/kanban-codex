# checklist-items-service

**File:** `server/src/services/checklist-items.ts`  
**Status:** implemented

## Purpose

Append, edit, toggle, and delete checklist items.

## Public interface

`createChecklistItem`, `updateChecklistItem`, `deleteChecklistItem`.

## Data access

Reads cards/checklist items; writes checklist rows and parent `updated_at`.

## Transaction boundaries

Every mutation is atomic.

## Validation

Non-empty text and non-empty patches; new items append with fractional positions.

## Errors

| Code                                         | HTTP | Condition           |
| -------------------------------------------- | ---- | ------------------- |
| `CARD_NOT_FOUND`, `CHECKLIST_ITEM_NOT_FOUND` | 404  | Parent/item absent. |

## Invariants

Positions are lexical and done maps between integer and boolean.

## Failure modes

Missing entities and storage errors roll back.

## Test cases

- Append, edit, toggle, delete, and missing entities.
