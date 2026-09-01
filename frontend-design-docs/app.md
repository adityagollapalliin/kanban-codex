# App

**File:** `web/src/App.tsx`  
**Status:** implemented

## Purpose

Provide the minimal Phase 1 application shell and prove the React application boots. It does not fetch or render board data.

## Props

| Prop | Type | Required | Description                          |
| ---- | ---- | -------- | ------------------------------------ |
| None | —    | —        | The scaffold has no external inputs. |

## State ownership

No local or server state is owned in this phase.

## Data dependencies

None. TanStack Query is introduced with the board UI rather than configured without a consumer.

## Interactions

None.

## Keyboard & accessibility

The page uses a landmark and heading hierarchy. There are no interactive controls or custom focus behaviours.

## Visual states

Default is a compact readiness message. Hover, focus, loading, empty, error, disabled, dragging, and over-WIP-limit states are not applicable.

## Composition

Rendered by `main.tsx`; it has no child components.

## Edge cases

The shell remains readable on narrow screens and under the user's preferred light or dark color scheme.

## Open questions

None for Phase 1.
