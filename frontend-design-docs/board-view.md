# BoardView

**File:** `web/src/features/board/BoardView.tsx`  
**Status:** implemented

## Purpose

Fetch and render the board, coordinate sortable cards and columns, and persist drops; it does not edit card content or filter data.

## Props

| Prop | Type | Required | Description            |
| ---- | ---- | -------- | ---------------------- |
| None | —    | —        | Reads the board query. |

## State ownership

Hydrate comes from TanStack Query. Local state tracks the active drag, the pre-drag snapshot, and the latest move error.

## Data dependencies

Calls `useBoardQuery`, `useMoveCardMutation`, and `useMoveColumnMutation` for `['board']`.

## Interactions

Loading renders `BoardSkeleton`; failures throw to retry boundary. Dragging previews cache order, drop persists neighbors, cancellation restores the snapshot, and persistence failure rolls back with an alert.

## Keyboard & accessibility

Main board region is labelled by its heading. Pointer and keyboard sensors support Space, arrows, and Escape. Live announcements identify moves and outcomes.

## Visual states

Default, loading, empty, dragging, overlay, and mutation-error states apply. Query error is delegated; over-WIP remains a warning in the child header.

## Composition

Rendered by App; renders Column, BoardSkeleton, DragOverlayCard, and DragErrorToast.

## Edge cases

Zero columns, empty destination columns, hundreds of items, no-op drops, cancellation, offline persistence, and mid-drag refresh.

## Open questions

Filter-derived columns arrive in Phase 8.
