# DragOverlayCard

**File:** `web/src/features/board/DragOverlayCard.tsx`  
**Status:** implemented

## Purpose

Render a lightweight visual preview for the active card or column. It is decorative and does not own drag behavior.

## Props

| Prop  | Type                 | Required | Description                       |
| ----- | -------------------- | -------- | --------------------------------- |
| title | `string`             | Yes      | Active item title.                |
| kind  | `'card' \| 'column'` | Yes      | Selects preview sizing and label. |

## State ownership

No local state; the parent supplies active-item data.

## Data dependencies

None.

## Interactions

None; the overlay has disabled pointer events.

## Keyboard & accessibility

The preview is `aria-hidden`; announcements describe the active item separately.

## Visual states

Dragging applies elevation and slight scale. Other states are not applicable.

## Composition

Rendered by `BoardView` inside dnd-kit's `DragOverlay`.

## Edge cases

Long titles truncate. A missing active item renders no overlay.

## Open questions

None.
