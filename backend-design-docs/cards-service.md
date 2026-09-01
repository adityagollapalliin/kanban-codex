# cards-service

**File:** `server/src/services/cards.ts`  
**Status:** implemented

## Purpose

Create, edit, label, archive, restore, move, paginate, and hard-delete cards.

## Public interface

`createCard`, `updateCard`, `moveCardByNeighbors`, `deleteArchivedCard`, `listArchivedCards`, and `getCard`.

## Data access

Reads/writes cards, columns, labels, card_labels, and checklist_items using ordering/archive indexes.

## Transaction boundaries

Every mutation is atomic; ordering service owns move transactions.

## Validation

Labels belong to the card board; creates default bottom; hard delete requires archive; neighbour IDs are authoritative.

## Errors

| Code                                                         | HTTP | Condition       |
| ------------------------------------------------------------ | ---- | --------------- |
| `COLUMN_NOT_FOUND`, `CARD_NOT_FOUND`, `LABEL_NOT_FOUND`      | 404  | Entity absent.  |
| `CARD_NOT_ARCHIVED`, `NEIGHBOR_CONFLICT`, `CROSS_BOARD_MOVE` | 409  | State conflict. |

## Invariants

Writes bump timestamps, labels replace atomically, and active results exclude archives.

## Failure modes

Invalid labels, stale neighbours, and storage failures roll back.

## Test cases

- Top/bottom create, all patch fields, labels, archive/restore, move, page, and delete.
