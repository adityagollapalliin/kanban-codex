# keyboard-map

**File:** `web/src/hooks/useKeyboardShortcuts.ts`  
**Status:** implemented

## Purpose

Centralize global shortcuts and their conflict rules. Text inputs and textareas consume character shortcuts; Escape remains available to close the drawer or overlay.

## Props

Not applicable.

## State ownership

The hook owns no persistent state; App owns overlay visibility and BoardView owns card focus/drawer state.

## Data dependencies

None.

## Interactions

`n` opens a card draft in the focused column, `/` focuses search, `Esc` closes the drawer/overlay, and `?` toggles the shortcut overlay. Browser defaults are prevented only when a shortcut is handled.

## Keyboard & accessibility

Shortcuts are listed in the overlay. Inputs, textareas, and content-editable elements are excluded except Escape.

## Visual states

No visual state; the overlay documents active shortcuts.

## Composition

Used by App and BoardView.

## Edge cases

Repeated keydown is ignored; focus in an editor never triggers `n`, `/`, or `?`.

## Open questions

None for Phase 8.
