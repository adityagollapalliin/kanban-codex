# Card

**File:** `web/src/features/board/Card.tsx`  
**Status:** implemented

## Purpose

Render a read-only summary of title, labels, due date, and checklist progress; it does not open the future drawer yet.

## Props

| Prop       | Type                         | Required | Description    |
| ---------- | ---------------------------- | -------- | -------------- |
| card       | `Card`                       | Yes      | Hydrated card. |
| labelsById | `ReadonlyMap<string, Label>` | Yes      | Label lookup.  |

## State ownership

No local React state; dnd-kit supplies transient sortable state.

## Data dependencies

None; receives query data and invalidates nothing.

## Interactions

The article is a sortable item. Pointer or Space initiates movement; BoardView owns optimistic persistence and rollback.

## Keyboard & accessibility

The article is focusable and labelled as draggable; dnd-kit supplies keyboard bindings. Metadata retains text equivalents and reading order.

## Visual states

Default, focus, hover, and dragging states apply. Loading/error/disabled/over-WIP are not applicable.

## Composition

Rendered by Column; renders LabelChip and DueDatePill.

## Edge cases

Long titles, unknown labels, no metadata, zero checklist items, and large checklists.

## Open questions

Drawer activation arrives in Phase 7.
