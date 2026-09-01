# BoardView

**File:** `web/src/features/board/BoardView.tsx`  
**Status:** implemented

## Purpose

Fetch and render the board title and horizontally scrolling columns; it does not mutate or filter data.

## Props

| Prop | Type | Required | Description            |
| ---- | ---- | -------- | ---------------------- |
| None | —    | —        | Reads the board query. |

## State ownership

No local state; hydrate comes from TanStack Query.

## Data dependencies

Calls `useBoardQuery` with `['board']`; invalidates nothing.

## Interactions

Loading renders `BoardSkeleton`; failures throw to retry boundary.

## Keyboard & accessibility

Main board region is labelled by its heading; DOM column order matches visual/tab order.

## Visual states

Default and loading apply. Empty board shows a calm message. Error is delegated. Dragging and over-WIP are child concerns/not applicable.

## Composition

Rendered by App; renders Column or BoardSkeleton.

## Edge cases

Zero columns, hundreds of columns/cards, long board names, offline fetch, and mid-render refresh.

## Open questions

Filter-derived columns arrive in Phase 8.
