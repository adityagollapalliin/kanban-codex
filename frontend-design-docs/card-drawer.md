# CardDrawer

**File:** `web/src/features/board/CardDrawer.tsx`  
**Status:** implemented

## Purpose

Provide a right-side detail drawer for editing one card's title, markdown description, due date, labels, checklist, and archive action. It is not a modal and does not edit board or column metadata.

## Props

| Prop      | Type               | Required | Description              |
| --------- | ------------------ | -------- | ------------------------ |
| card      | `Card`             | Yes      | Selected card.           |
| labels    | `readonly Label[]` | Yes      | Board label options.     |
| onClose   | `() => void`       | Yes      | Close and restore focus. |
| onArchive | `() => void`       | Yes      | Archive selected card.   |

## State ownership

Selected card ID and originating element are owned by BoardView. Draft title, description, due date, and label IDs are local and saved on blur/submit through mutations.

## Data dependencies

Uses card and checklist mutation hooks; successful mutations update `['board']`. No independent query is created.

## Interactions

Opening focuses the drawer heading. Fields optimistically update the card and roll back with an alert on failure. Archive removes the card optimistically and exposes Undo for eight seconds.

## Keyboard & accessibility

`aside` has `aria-labelledby`, Escape closes, and focus returns to the originating card. Inputs have labels; close and archive controls are labelled.

## Visual states

Open, saving, error, empty description, and archived action states apply. Loading is represented by disabled controls while a mutation is pending.

## Composition

Rendered by BoardView; renders LabelEditor, Checklist, and UndoToast.

## Edge cases

Long markdown, no labels, no checklist items, invalid dates, rapid edits, and a refetch while open retain the selected ID and latest server card.

## Open questions

None for Phase 7.
