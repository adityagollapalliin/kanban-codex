# export-import-routes

**File:** `server/src/routes/export-import.ts`  
**Status:** implemented

## Purpose

Expose attachment JSON export and validated import.

## Public interface

`createExportImportRouter(database): Router`

## Data access

None directly.

## Transaction boundaries

Owned by service.

## Validation

Shared dump and import-result schemas.

## Errors

| Code                                 | HTTP | Condition               |
| ------------------------------------ | ---- | ----------------------- |
| `VALIDATION_ERROR`, `IMPORT_INVALID` | 400  | Shape or graph invalid. |

## Invariants

Export sets `Content-Disposition`; import responds only after commit.

## Failure modes

Errors flow to middleware.

## Test cases

- Attachment export, replacement import, and non-destructive invalid import.
