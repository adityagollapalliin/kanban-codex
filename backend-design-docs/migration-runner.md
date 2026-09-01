# migration-runner

**File:** `server/src/db/migrate.ts`  
**Status:** implemented

## Purpose

Discover hand-written SQL migrations, verify their sequential identity, and apply pending files exactly once. It does not infer or generate schema changes.

## Public interface

`migrateDatabase(database: Database.Database, migrationsDirectory?: string): MigrationResult`

`MigrationResult` reports the filenames applied by that invocation. The module's CLI opens the configured database, migrates it, logs a structured result, and closes it.

## Data access

Reads `*.sql` files from the migrations directory. Creates and reads `_migrations`, then executes migration SQL against all application tables.

## Transaction boundaries

Each migration file and its metadata record commit atomically in a `better-sqlite3` transaction. Separate migrations remain separate commits so startup can resume safely.

## Validation

Filenames must match `NNN_name.sql`, start at `001`, and contain no numbering gaps or duplicates. Applied filenames and SHA-256 checksums must still match disk.

## Errors

| Code           | HTTP | Condition                                                                                                |
| -------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| Not applicable | —    | Invalid sequences, changed history, SQL errors, and database failures throw before later migrations run. |

## Invariants

Applied migrations are an immutable prefix of the on-disk sequence. A failed migration leaves neither partial schema changes nor a metadata row.

## Failure modes

Malformed SQL rolls back its migration. A changed or missing applied file stops startup. Disk-full errors preserve the last committed migration boundary.

## Test cases

- A fresh database applies `001_init.sql` and records it.
- A second run applies nothing.
- A failing migration rolls back its SQL and metadata.
- Gaps, duplicate numbers, missing applied files, and checksum changes are rejected.
