# FilterBar

**File:** `web/src/features/board/FilterBar.tsx`  
**Status:** implemented

## Purpose

Filter the already hydrated board locally by text, label, and overdue status. It never changes server state.

## Props

| Prop     | Type                           | Required | Description                 |
| -------- | ------------------------------ | -------- | --------------------------- |
| labels   | `readonly Label[]`             | Yes      | Label filter options.       |
| value    | `BoardFilter`                  | Yes      | Controlled filter state.    |
| onChange | `(value: BoardFilter) => void` | Yes      | Updates local filter state. |

## State ownership

BoardView owns the filter; the bar owns no state.

## Data dependencies

None.

## Interactions

Text searches title and description. Label and overdue controls update the local filter immediately.

## Keyboard & accessibility

Search is labelled and `/` focuses it. Label is a native select; overdue is a labelled checkbox.

## Visual states

Default, focused, filtered, and empty-result states apply.

## Composition

Rendered by BoardView above the columns.

## Edge cases

Case-insensitive matching, markdown text, no labels, and all cards filtered out.

## Open questions

None.
