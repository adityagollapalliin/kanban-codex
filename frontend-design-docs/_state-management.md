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

`boardQueryKey = ['board']`; `useBoardQuery` calls typed `GET /api/board`. No mutations or invalidations in Phase 5.

## Interactions

Initial load shows a skeleton. Failed fetches throw to the board boundary; retry resets the failed query.

## Keyboard & accessibility

Query transitions do not steal focus. Error retry is a standard button.

## Visual states

Loading and error are explicit; stale cached content remains renderable. Offline mutation/rollback and dragging are not applicable.

## Composition

QueryClient is created in `main.tsx`; App composes QueryErrorResetBoundary.

## Edge cases

Invalid response JSON is treated as an error. One-minute stale time avoids unnecessary local refresh churn.

## Open questions

Optimistic cache helpers are deferred to Phase 6.
