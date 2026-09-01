# ColumnHeader

**File:** `web/src/features/board/ColumnHeader.tsx`  
**Status:** implemented

## Purpose

Present the column name and count/WIP status; it does not edit the column.

## Props

| Prop     | Type             | Required | Description                 |
| -------- | ---------------- | -------- | --------------------------- |
| id       | `string`         | Yes      | Heading association.        |
| name     | `string`         | Yes      | Display title.              |
| count    | `number`         | Yes      | Active card count.          |
| wipLimit | `number \| null` | Yes      | Optional warning threshold. |

## State ownership

None; WIP tone is derived.

## Data dependencies

None.

## Interactions

None.

## Keyboard & accessibility

Semantic heading; count text includes WIP meaning without relying on color.

## Visual states

Neutral below limit, amber at limit, red over limit. Other states are not applicable.

## Composition

Rendered by Column.

## Edge cases

Zero limit, long name, and large counts.

## Open questions

Column action controls arrive with CRUD UI.
