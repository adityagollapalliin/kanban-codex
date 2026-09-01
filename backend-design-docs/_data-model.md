# data-model

**File:** `server/src/db/migrations/001_init.sql`  
**Status:** implemented

## Purpose

Define the durable SQLite representation of a single board, its ordered columns and cards, labels, and checklist items. Session storage is deferred to the authentication phase.

## Public interface

The migration creates `boards`, `columns`, `cards`, `labels`, `card_labels`, and `checklist_items` with the columns specified in the product data model.

## Data access

Foreign keys encode ownership and cascade deletion. `idx_columns_board`, `idx_cards_column`, and `idx_cards_archived` support the hydrate, ordering, and archive queries planned for later phases.

## Transaction boundaries

The migration runner applies the schema and records its checksum in one transaction. Connection-level WAL and foreign-key settings are also enforced before migration execution.

## Validation

SQLite enforces required fields, primary keys, foreign keys, and the composite uniqueness of card-label assignments. API-level Zod schemas will provide richer validation in Phase 4.

## Errors

| Code           | HTTP | Condition                                                                     |
| -------------- | ---- | ----------------------------------------------------------------------------- |
| Not applicable | —    | Schema constraint failures surface as database errors to the calling service. |

## Invariants

Positions are non-null lexical keys scoped to their parent. Card archives are soft deletes; parent removal cascades to owned data. Timestamps are UTC ISO-8601 text.

## Failure modes

Foreign-key violations abort the write. Disk-full and malformed-schema failures roll back the active migration. WAL sidecar files remain beside the configured database.

## Test cases

- Every required table and index exists after migration.
- Foreign keys are enabled and cascading board deletion removes descendants.
- Reopening and rerunning migrations is idempotent.
