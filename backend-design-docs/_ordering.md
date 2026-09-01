# ordering

**File:** `shared/src/ordering.ts`  
**Status:** implemented

## Purpose

Expose the single fractional-indexing vocabulary used by optimistic clients and authoritative server services. It generates lexical positions but does not read or mutate storage.

## Public interface

`generatePositionBetween(previous: string | null, next: string | null): string`

`generateEvenPositions(count: number): readonly string[]`

`isPositionStrictlyBetween(position: string, previous: string | null, next: string | null): boolean`

`MAX_POSITION_LENGTH = 40`

## Data access

None. Consumers persist the returned opaque strings and sort them lexicographically.

## Transaction boundaries

Not applicable.

## Validation

`fractional-indexing` rejects malformed keys and non-increasing boundaries. Counts must be non-negative integers.

## Errors

| Code           | HTTP | Condition                                                                      |
| -------------- | ---- | ------------------------------------------------------------------------------ |
| Not applicable | —    | Invalid keys, reversed boundaries, or invalid counts throw before persistence. |

## Invariants

Generated keys compare strictly after `previous` and before `next` when either boundary exists. Even-position generation preserves count and lexical order.

## Failure modes

Invalid caller boundaries propagate a descriptive package error. Key growth is handled by the server rebalance policy rather than hidden in this pure module.

## Test cases

- Insert at head, tail, and middle.
- Strict-between validation handles bounded and unbounded positions.
- Even positions are ordered and match the requested count.
