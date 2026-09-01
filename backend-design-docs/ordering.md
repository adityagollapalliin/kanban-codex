# ordering

**File:** `server/src/services/ordering.ts`  
**Status:** implemented

## Purpose

Move active cards within or across columns using authoritative neighbour rows, and rebalance a column when fractional keys become long. It does not expose HTTP or own card CRUD beyond position and column changes.

## Public interface

`moveCard(database: Database.Database, input: MoveCardInput): MoveCardResult`

`rebalanceColumn(database: Database.Database, columnId: string): RebalanceResult`

`MoveCardInput` contains `cardId`, `toColumnId`, `prevCardId`, `nextCardId`, and an injectable UTC timestamp for deterministic tests.

## Data access

Reads `cards` and `columns`, relying on `idx_cards_column` for ordered active siblings. Updates the moved card's `column_id`, `position`, and `updated_at`; rebalance updates active card positions in lexical order.

## Transaction boundaries

Each public operation runs in one `better-sqlite3` transaction. A move and any length-triggered rebalance commit or roll back together.

## Validation

Shared ordering helpers validate fractional boundaries. The service requires an active card, an existing target column on the same board, distinct neighbours in that target, neighbours in increasing order, and a target gap defined after removing the moving card.

## Errors

| Code                 | HTTP | Condition                                                                     |
| -------------------- | ---- | ----------------------------------------------------------------------------- |
| `CARD_NOT_FOUND`     | —    | The moving card is missing or archived.                                       |
| `COLUMN_NOT_FOUND`   | —    | The target column is missing.                                                 |
| `CROSS_BOARD_MOVE`   | —    | Source and target columns belong to different boards.                         |
| `NEIGHBOR_NOT_FOUND` | —    | A claimed neighbour is missing, archived, or outside the target column.       |
| `INVALID_NEIGHBORS`  | —    | Neighbours are identical, reversed, or do not describe a valid insertion gap. |

HTTP mapping is deferred to Phase 4.

## Invariants

Active card positions remain strictly ordered within a column. Exact moves to the card's current immediate gap are no-ops. Rebalance preserves visible order and replaces all active positions with compact, evenly generated keys. Archived cards are not moved or rebalanced.

## Failure modes

Stale neighbours abort without writes. If another card has arrived inside a still-valid claimed gap, the service derives an immediate current sub-gap so sequential concurrent requests cannot produce duplicate keys. Constraint, disk, or generation errors roll back the operation. If any target-column active key exceeds 40 characters after a real move, that column is rebalanced in the same transaction.

## Test cases

- Insert/move at head, tail, and middle.
- Move across columns and update only the moving card in the normal path.
- Derive a unique current sub-gap when another card arrived between claimed neighbours.
- Moving to the current immediate gap is a no-op.
- Missing, wrong-column, reversed, duplicate, and cross-board neighbours fail without writes.
- Rebalance preserves order and produces compact unique keys.
- A move automatically rebalances a target column containing an overlong key.
