# columns-service

**File:** `server/src/services/columns.ts`  
**Status:** implemented

## Purpose

Create, update, reposition, and delete columns; not card CRUD.

## Public interface

`createColumn`, `updateColumn`, and `deleteColumn` using shared inputs.

## Data access

Reads/writes boards and columns and counts cards; uses `idx_columns_board`.

## Transaction boundaries

Every mutation, including neighbour validation, is atomic.

## Validation

Neighbours must be distinct, present on the board, ordered, and supplied as a pair; current sub-gaps avoid duplicate keys.

## Errors

| Code                                    | HTTP | Condition                        |
| --------------------------------------- | ---- | -------------------------------- |
| `BOARD_NOT_FOUND`, `COLUMN_NOT_FOUND`   | 404  | Entity absent.                   |
| `NEIGHBOR_CONFLICT`, `COLUMN_NOT_EMPTY` | 409  | Stale ordering or unsafe delete. |

## Invariants

Positions remain lexical; writes bump `updated_at`; non-forced delete never loses cards.

## Failure modes

Conflicts and storage errors roll back.

## Test cases

- Append, edit, WIP clear, reposition; empty/forced/conflicting delete.
