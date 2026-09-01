# DragErrorToast

**File:** `web/src/components/DragErrorToast.tsx`  
**Status:** implemented

## Purpose

Report a failed card or column move after optimistic rollback. It does not retry or retain a toast queue.

## Props

| Prop      | Type             | Required | Description                       |
| --------- | ---------------- | -------- | --------------------------------- |
| message   | `string \| null` | Yes      | Failure message, or null to hide. |
| onDismiss | `() => void`     | Yes      | Clears the current message.       |

## State ownership

No local state. `BoardView` owns the current error message.

## Data dependencies

None.

## Interactions

Dismiss invokes `onDismiss`; a new failure replaces the current message.

## Keyboard & accessibility

Uses `role="alert"`; dismiss is a labelled native button with a visible focus ring.

## Visual states

Hidden when null; otherwise fixed, high-contrast error presentation. Other states are not applicable.

## Composition

Rendered by `BoardView`.

## Edge cases

Long messages wrap. Multiple rapid failures show the latest message.

## Open questions

None.
