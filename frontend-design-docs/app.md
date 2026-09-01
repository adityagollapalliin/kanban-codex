# App

**File:** `web/src/App.tsx`  
**Status:** implemented

## Purpose

Provide the application frame, title treatment, and error-reset boundary around the read-only board. Query ownership remains in `BoardView`.

## Props

| Prop | Type | Required | Description                          |
| ---- | ---- | -------- | ------------------------------------ |
| None | —    | —        | The scaffold has no external inputs. |

## State ownership

No local state. The root QueryClient is provided by `main.tsx`; query error reset is composed here.

## Data dependencies

Composes `BoardView`, whose `useBoardQuery` uses `['board']`.

## Interactions

Retry in the error fallback resets both the React boundary and TanStack Query error state.

## Keyboard & accessibility

The page uses banner/main landmarks and heading hierarchy. Retry receives normal keyboard focus and a visible ring.

## Visual states

Default shows the board shell. Loading and error are delegated; dragging is not applicable until Phase 6.

## Composition

Rendered by `main.tsx`; renders `BoardErrorBoundary` and `BoardView`.

## Edge cases

The shell remains readable on narrow screens and under the user's preferred light or dark color scheme.

## Open questions

None for Phase 1.
