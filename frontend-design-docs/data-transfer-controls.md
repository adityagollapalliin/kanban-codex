# DataTransferControls

**File:** `web/src/components/DataTransferControls.tsx`  
**Status:** implemented

## Purpose

Offer full JSON export and validated replacement import controls. It does not edit individual cards.

## Props

| Prop    | Type                        | Required | Description                |
| ------- | --------------------------- | -------- | -------------------------- |
| onError | `(message: string) => void` | Yes      | Reports transfer failures. |

## State ownership

Import busy state is local; the board query owns imported data after invalidation.

## Data dependencies

Calls `GET /api/export` and `POST /api/import`, then invalidates `['board']`.

## Interactions

Export downloads an attachment. Import reads a selected JSON file and submits it; failures leave the current board intact.

## Keyboard & accessibility

Buttons and file input have explicit labels. Busy state is conveyed in button text.

## Visual states

Default, busy, and error states apply.

## Composition

Rendered in App's header.

## Edge cases

Large files, malformed JSON, and cancelled file selection are handled without navigation.

## Open questions

None.
