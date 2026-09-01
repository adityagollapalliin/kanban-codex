# BoardErrorBoundary

**File:** `web/src/components/BoardErrorBoundary.tsx`  
**Status:** implemented

## Purpose

Contain board render/query errors and provide a user-driven retry without crashing the app shell.

## Props

| Prop     | Type         | Required | Description                   |
| -------- | ------------ | -------- | ----------------------------- |
| children | `ReactNode`  | Yes      | Board subtree.                |
| onReset  | `() => void` | Yes      | Resets TanStack query errors. |

## State ownership

Owns only the caught-error flag; QueryClient owns request state.

## Data dependencies

Calls the reset callback; no query key invalidation directly.

## Interactions

Retry clears boundary state and query error state, causing a new fetch; repeated failure returns to fallback.

## Keyboard & accessibility

Fallback uses alert semantics; retry is keyboard-operable with visible focus.

## Visual states

Error and retry-focus apply. Loading/empty/disabled/dragging/over-WIP are not applicable.

## Composition

Rendered by App around BoardView.

## Edge cases

Unknown thrown values receive a generic safe message.

## Open questions

None.
