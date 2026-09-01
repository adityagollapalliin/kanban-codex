# board-service

**File:** `server/src/services/board.ts`  
**Status:** implemented

## Purpose

Hydrate the single board with ordered columns, active cards, labels, assignments, and checklists.

## Public interface

`getBoard(database: Database.Database): BoardHydrate`

## Data access

Reads all application tables and ordering indexes; excludes archived cards.

## Transaction boundaries

One deferred read transaction provides a consistent snapshot.

## Validation

The route applies `boardHydrateSchema`.

## Errors

| Code              | HTTP | Condition        |
| ----------------- | ---- | ---------------- |
| `BOARD_NOT_FOUND` | 404  | No board exists. |

## Invariants

Columns/cards/checklists are lexical and each child appears once under its parent.

## Failure modes

Storage failures propagate; foreign keys prevent dangling rows.

## Test cases

- Ordered hydrate excludes archived cards; empty DB fails.
