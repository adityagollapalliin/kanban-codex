# client

**File:** `server/src/db/client.ts`  
**Status:** implemented

## Purpose

Open a synchronous SQLite connection with the durability and integrity settings required by the application. It does not migrate, seed, or own process signals.

## Public interface

`openDatabase(databasePath: string): Database.Database`

## Data access

Creates the database and parent directory when needed. Applies `journal_mode = WAL`, `foreign_keys = ON`, and a bounded busy timeout to every connection.

## Transaction boundaries

None. Callers establish transactions around logical mutations and migrations.

## Validation

The configuration schema supplies a non-empty path. SQLite validates that the target is a usable database.

## Errors

| Code           | HTTP | Condition                                                                            |
| -------------- | ---- | ------------------------------------------------------------------------------------ |
| Not applicable | —    | Open, permission, corruption, and pragma failures propagate to bootstrap or scripts. |

## Invariants

Every file-backed connection reports WAL mode, and every connection has foreign keys enabled. Parent directory creation never targets the special in-memory database.

## Failure modes

An unwritable directory, invalid file, or corrupt database prevents connection creation. The partially opened handle is closed if configuration fails.

## Test cases

- A file database is created with WAL and foreign keys enabled.
- An in-memory database opens without filesystem work.
- Foreign-key violations are rejected.
