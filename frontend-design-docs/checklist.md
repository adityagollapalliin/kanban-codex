# Checklist

**File:** `web/src/features/board/Checklist.tsx`  
**Status:** implemented

## Purpose

Display and mutate a card's ordered checklist items. It does not manage card fields.

## Props

| Prop   | Type                       | Required | Description              |
| ------ | -------------------------- | -------- | ------------------------ |
| cardId | `string`                   | Yes      | Owning card ID.          |
| items  | `readonly ChecklistItem[]` | Yes      | Ordered checklist items. |

## State ownership

The add-item draft is local; item content and completion are server state updated optimistically.

## Data dependencies

Calls checklist create/update/delete mutations and invalidates or updates `['board']`.

## Interactions

Checkbox toggles and text edits optimistically update one item. Add appends an item; delete removes it. Failed writes restore the previous board and announce an error.

## Keyboard & accessibility

Every checkbox and delete button has a label. Text fields are keyboard reachable and Enter submits a new item.

## Visual states

Empty, normal, completed, saving, and error states apply.

## Composition

Rendered by CardDrawer.

## Edge cases

Long text wraps; empty submissions are rejected client-side; hundreds of items remain scrollable.

## Open questions

None.
