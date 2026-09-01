# export-import-service

**File:** `server/src/services/export-import.ts`  
**Status:** implemented

## Purpose

Produce a complete versioned dump and atomically replace application data without altering migration history.

## Public interface

`exportDatabase(database): ExportDump`; `importDatabase(database, dump): ImportResult`.

## Data access

Reads/writes all application tables and card_labels; never `_migrations`.

## Transaction boundaries

Export is one read snapshot; import deletes/reinserts the graph in one transaction.

## Validation

Shared dump schema plus referential graph checks before deletion.

## Errors

| Code             | HTTP | Condition                    |
| ---------------- | ---- | ---------------------------- |
| `IMPORT_INVALID` | 400  | References are inconsistent. |

## Invariants

Failed import preserves old data; round-trip preserves every application row and key.

## Failure modes

Graph, constraint, and storage errors roll back replacement.

## Test cases

- Identical round-trip; invalid graph preserves current board.
