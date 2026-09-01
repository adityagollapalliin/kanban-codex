# ShortcutsOverlay

**File:** `web/src/components/ShortcutsOverlay.tsx`  
**Status:** implemented

## Purpose

Show the keyboard shortcut reference in an accessible overlay. It does not implement shortcuts.

## Props

| Prop    | Type         | Required | Description         |
| ------- | ------------ | -------- | ------------------- |
| onClose | `() => void` | Yes      | Closes the overlay. |

## State ownership

Visibility is owned by App.

## Data dependencies

None.

## Interactions

Close button or Escape dismisses the overlay.

## Keyboard & accessibility

Uses dialog semantics, labelled heading, focusable close button, and focus return through the parent.

## Visual states

Open and closed states apply.

## Composition

Rendered by App.

## Edge cases

Small viewports scroll the reference; shortcuts remain readable in dark mode.

## Open questions

None.
