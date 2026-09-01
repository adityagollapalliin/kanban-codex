# state-management

**File:** `web/src/api/board.ts`  
**Status:** implemented

## Purpose

Define the server-state boundary and cache shape for the board hydrate.

## Props

Not applicable.

## State ownership

TanStack Query owns the `BoardHydrate`; components derive display-only values without copying server state.

## Data dependencies

`boardQueryKey = ['board']`; `useBoardQuery` calls typed `GET /api/board`. Move mutations snapshot and optimistically replace that cache entry, roll back on error, and invalidate on settlement.

## Interactions

Initial load shows a skeleton. Failed fetches throw to the board boundary; retry resets the failed query. Drag previews update the cached board, persistence failure restores the captured snapshot, and settlement reconciles with the server.

## Keyboard & accessibility

Query transitions do not steal focus. Error retry is a standard button.

## Visual states

Loading and error are explicit; stale cached content remains renderable. Offline move failure rolls back and displays an alert.

## Composition

QueryClient is created in `main.tsx`; App composes QueryErrorResetBoundary.

## Edge cases

Invalid response JSON is treated as an error. One-minute stale time avoids unnecessary local refresh churn.

## Open questions

None for Phase 6.
