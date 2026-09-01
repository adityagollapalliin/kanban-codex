# drag-and-drop

**File:** `web/src/features/board/BoardView.tsx`  
**Status:** implemented

## Purpose

Define card and column drag behavior, sensors, collision rules, optimistic persistence, and accessible announcements. It does not define CRUD editing.

## Props

Not applicable.

## State ownership

`BoardView` owns the active drag descriptor. TanStack Query owns the board snapshot and optimistic reorder. dnd-kit owns sensor and transient transform state.

## Data dependencies

Card drops call `useMoveCardMutation`; column drops call `useMoveColumnMutation`. Both update `['board']`, restore the previous snapshot on failure, and invalidate after settlement.

## Interactions

Pointer or Space starts a drag. Card over-events preview moves across and within columns; drop persists neighbor IDs. Column drops optimistically reorder and persist neighbor IDs. Cancellation restores the pre-drag snapshot. Failed persistence rolls back and displays a toast.

## Keyboard & accessibility

Pointer and Keyboard sensors are enabled. Space picks up and drops, arrows navigate sortable targets, and Escape cancels. Announcements describe pickup, movement, drop, cancellation, and persistence failure.

## Visual states

Dragging items reduce opacity; the overlay follows the pointer or focus; valid empty columns remain visible drop targets. WIP limits warn visually but never reject a drop.

## Composition

`BoardView` composes `DndContext`, sortable contexts, `DragOverlay`, `DragOverlayCard`, and `DragErrorToast`.

## Edge cases

Same-gap drops are no-ops. Empty columns accept cards. Cancellation restores the initial snapshot. Server refresh is deferred until settlement. Missing active or over records cancel safely.

## Open questions

None for Phase 6.
