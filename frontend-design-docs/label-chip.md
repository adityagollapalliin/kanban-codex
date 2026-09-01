# LabelChip

**File:** `web/src/components/LabelChip.tsx`  
**Status:** implemented

## Purpose

Show a compact label name and its configured color without owning label behavior.

## Props

| Prop  | Type    | Required | Description         |
| ----- | ------- | -------- | ------------------- |
| label | `Label` | Yes      | Name and hex color. |

## State ownership

None.

## Data dependencies

None.

## Interactions

None.

## Keyboard & accessibility

Color is decorative; visible text communicates identity.

## Visual states

Default only; other states are not applicable.

## Composition

Rendered by Card.

## Edge cases

Long names truncate with a title tooltip; pale/dark custom colors retain a neutral container.

## Open questions

None.
