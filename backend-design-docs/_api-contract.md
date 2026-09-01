# api-contract

**File:** `shared/src/schema.ts`  
**Status:** implemented

## Purpose

Define every JSON entity, request, response, query, and dump shape shared by server and web; no business behavior.

## Public interface

Exports board, column, card, label, checklist, mutation, archive-page, dump, health, and error Zod schemas and inferred types.

## Data access

None.

## Transaction boundaries

Not applicable.

## Validation

Non-empty IDs/names; hex colors; non-negative nullable WIP limits; ISO timestamps; strict objects and non-empty patches. Column moves require both neighbour fields. Imports contain at most one board.

## Errors

| Code               | HTTP | Condition                                        |
| ------------------ | ---- | ------------------------------------------------ |
| `VALIDATION_ERROR` | 400  | Request, query, or dump fails schema validation. |

## Invariants

Wire fields are camelCase, checklist completion is boolean, and every response is parsed before serialization.

## Failure modes

Malformed input never reaches services; invalid service output becomes an internal error.

## Test cases

- Invalid empty patches and incomplete neighbour pairs fail.
- Route tests exercise every request and response schema.
