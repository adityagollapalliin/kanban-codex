# Column

**File:** `web/src/features/board/Column.tsx`  
**Status:** implemented

## Purpose

Render one fixed-width lane with an independently scrolling active-card list and visible empty target hint.

## Props

| Prop       | Type                         | Required | Description                   |
| ---------- | ---------------------------- | -------- | ----------------------------- |
| column     | `HydratedColumn`             | Yes      | Column metadata and cards.    |
| labelsById | `ReadonlyMap<string, Label>` | Yes      | Label lookup shared by cards. |

## State ownership

None.

## Data dependencies

Receives hydrate data; calls no hooks and invalidates nothing.

## Interactions

Read-only scrolling only; optimistic/rollback paths are not applicable.

## Keyboard & accessibility

Section is labelled by header; card list uses list semantics; scroll container remains keyboard-scrollable.

## Visual states

Default, empty, at-limit, and over-limit via header. Loading/error/disabled/dragging are not applicable.

## Composition

Rendered by BoardView; renders ColumnHeader and Card.

## Edge cases

Zero and hundreds of cards, long names, missing imported label references, and narrow viewports.

## Open questions

Drop-target styling is finalized in Phase 6.
