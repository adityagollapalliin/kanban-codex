# BoardSkeleton

**File:** `web/src/components/BoardSkeleton.tsx`  
**Status:** implemented

## Purpose

Reserve the approximate board layout during initial hydration without using a spinner.

## Props

| Prop | Type | Required | Description                    |
| ---- | ---- | -------- | ------------------------------ |
| None | —    | —        | Fixed representative skeleton. |

## State ownership

None.

## Data dependencies

None.

## Interactions

None.

## Keyboard & accessibility

Container announces loading status; decorative blocks are hidden.

## Visual states

Loading only; all other states are not applicable.

## Composition

Rendered by BoardView.

## Edge cases

Responsive widths match real columns and remain horizontally scrollable.

## Open questions

None.
