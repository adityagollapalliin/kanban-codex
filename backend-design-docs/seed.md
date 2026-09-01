# seed

**File:** `server/src/seed.ts`  
**Status:** implemented

## Purpose

Create a demonstration board with three columns and eight cards for local evaluation. It does not alter a database that already contains a board.

## Public interface

`seedDatabase(database: Database.Database): SeedResult`

The executable module migrates the configured database, seeds it, emits a structured result, and closes the connection.

## Data access

Reads `boards`; writes `boards`, `columns`, and `cards`. IDs are generated server-side with nanoid and timestamps are UTC ISO-8601 strings.

## Transaction boundaries

The presence check and complete demo dataset insertion are one transaction, preventing a partially seeded board.

## Validation

Static seed content follows database constraints. Fractional positions use initial lexical keys suitable for Phase 3 replacement by the shared ordering helper.

## Errors

| Code           | HTTP | Condition                                                                   |
| -------------- | ---- | --------------------------------------------------------------------------- |
| Not applicable | —    | Constraint and storage errors propagate and roll back the seed transaction. |

## Invariants

At most one seed dataset is added. A successful fresh seed creates exactly one board, three ordered columns, and eight non-archived cards.

## Failure modes

Existing user data results in a no-op. Any failed insert rolls back all seed inserts. Migration failures prevent seeding.

## Test cases

- A fresh migrated database receives the expected board, columns, and cards.
- Running seed twice does not duplicate data.
