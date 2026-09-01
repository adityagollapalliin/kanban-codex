# backup

**File:** `scripts/backup.mjs`  
**Status:** implemented

## Purpose

Create a timestamped consistent SQLite online backup without stopping the server.

## Public interface

`npm run backup` reads `DATABASE_PATH` and writes `backups/kanban-<UTC timestamp>.sqlite`.

## Data access

Uses better-sqlite3's online backup API and does not mutate the source database.

## Transaction boundaries

SQLite coordinates the online backup snapshot.

## Validation

Missing or in-memory database paths fail with a readable message.

## Errors

| Code | HTTP | Condition                            |
| ---- | ---- | ------------------------------------ |
| N/A  | N/A  | CLI exits nonzero on backup failure. |

## Invariants

The source database remains untouched; destination is timestamped and recoverable with SQLite.

## Failure modes

Missing source, unwritable backup directory, or disk-full errors are reported.

## Test cases

- Backup creates a readable file from a seeded database.
- Missing path exits with a readable error.
