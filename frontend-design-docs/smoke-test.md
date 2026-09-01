# smoke-test

**File:** `e2e/smoke.spec.ts`  
**Status:** implemented

## Purpose

Verify the built single-process app boots, hydrates a seeded board, renders core board content, and opens a card drawer.

## Props

Not applicable.

## State ownership

Playwright owns browser context and cleanup; the server owns SQLite state.

## Data dependencies

Uses the configured local server and seeded demo board.

## Interactions

Navigate to the app, assert board and demo columns, click a card, and assert the drawer.

## Keyboard & accessibility

Assertions use accessible roles and names.

## Visual states

Smoke covers loaded board and drawer-open states; detailed visual regression is out of scope.

## Composition

Runs against the production build through Playwright's webServer command.

## Edge cases

The test uses an isolated temporary database and does not rely on developer data.

## Open questions

None.
