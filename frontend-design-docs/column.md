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

No local React state; dnd-kit supplies transient sortable and drop-target state.

## Data dependencies

Receives hydrate data; calls no hooks and invalidates nothing.

## Interactions

The column and its empty body are sortable/drop targets. Persistence and rollback are coordinated by BoardView.

## Keyboard & accessibility

Section is labelled by its sortable header; card list uses list semantics and remains keyboard-scrollable.

## Visual states

Default, empty, card-over, column-dragging, at-limit, and over-limit states apply. Loading/error/disabled are not applicable.

## Composition

Rendered by BoardView; renders ColumnHeader and Card.

## Edge cases

Zero and hundreds of cards, long names, missing imported label references, and narrow viewports.

## Open questions

None for Phase 6.
