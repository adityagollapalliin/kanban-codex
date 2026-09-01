# UndoToast

**File:** `web/src/components/UndoToast.tsx`  
**Status:** implemented

## Purpose

Offer an eight-second undo action after archiving a card. It does not queue multiple archives.

## Props

| Prop      | Type         | Required | Description         |
| --------- | ------------ | -------- | ------------------- |
| cardTitle | `string`     | Yes      | Archived card name. |
| onUndo    | `() => void` | Yes      | Restores the card.  |
| onExpire  | `() => void` | Yes      | Clears the toast.   |

## State ownership

The parent owns visibility and archived-card identity; the component owns only its countdown timer.

## Data dependencies

Undo invokes the parent's unarchive mutation.

## Interactions

Undo persists `archived: false`; expiry dismisses the toast. Failures remain visible through the parent's alert.

## Keyboard & accessibility

Uses `role="status"` with a labelled Undo button and does not steal focus.

## Visual states

Visible countdown and hidden states apply.

## Composition

Rendered by BoardView.

## Edge cases

Unmount clears the timer; repeated archive replaces the previous toast.

## Open questions

None.
