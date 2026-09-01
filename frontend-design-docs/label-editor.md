# LabelEditor

**File:** `web/src/features/board/LabelEditor.tsx`  
**Status:** implemented

## Purpose

Toggle existing board labels on the selected card. Label creation is out of scope because the API has no label-management endpoint.

## Props

| Prop        | Type                               | Required | Description             |
| ----------- | ---------------------------------- | -------- | ----------------------- |
| labels      | `readonly Label[]`                 | Yes      | Available board labels. |
| selectedIds | `readonly string[]`                | Yes      | Current card label IDs. |
| onChange    | `(ids: readonly string[]) => void` | Yes      | Persists selection.     |

## State ownership

Selection is controlled by CardDrawer and mirrors the card query state.

## Data dependencies

Card update mutation through the parent.

## Interactions

Click or Space toggles a label and invokes `onChange`; failure is handled by the parent rollback.

## Keyboard & accessibility

Labels use checkbox semantics with text and color-independent names.

## Visual states

Selected, unselected, focused, disabled, and no-labels states apply.

## Composition

Rendered by CardDrawer using LabelChip styling.

## Edge cases

Unknown selected IDs are ignored visually; many labels wrap within the drawer.

## Open questions

None.
