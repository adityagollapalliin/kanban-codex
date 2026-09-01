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

None.

## Data dependencies

None; receives query data and invalidates nothing.

## Interactions

No click action in Phase 5; optimistic/rollback paths are not applicable.

## Keyboard & accessibility

List item/article semantics; metadata has text equivalents and sensible reading order.

## Visual states

Default and metadata variants apply. Hover hints future interactivity; loading/error/disabled/dragging/over-WIP are not applicable.

## Composition

Rendered by Column; renders LabelChip and DueDatePill.

## Edge cases

Long titles, unknown labels, no metadata, zero checklist items, and large checklists.

## Open questions

Drawer activation and draggable affordances arrive later.
