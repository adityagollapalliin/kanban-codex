# ColumnHeader

**File:** `web/src/features/board/ColumnHeader.tsx`  
**Status:** implemented

## Purpose

Present the column name and count/WIP status; it does not edit the column.

## Props

| Prop            | Type                                      | Required | Description                                 |
| --------------- | ----------------------------------------- | -------- | ------------------------------------------- |
| id              | `string`                                  | Yes      | Heading association.                        |
| name            | `string`                                  | Yes      | Display title.                              |
| count           | `number`                                  | Yes      | Active card count.                          |
| wipLimit        | `number \| null`                          | Yes      | Optional warning threshold.                 |
| dragHandleProps | `ButtonHTMLAttributes<HTMLButtonElement>` | Yes      | Keyboard-accessible column handle bindings. |

## State ownership

None; WIP tone is derived.

## Data dependencies

The labelled drag handle starts pointer or keyboard column movement.

## Interactions

None.

## Keyboard & accessibility

Semantic heading; count text includes WIP meaning without relying on color. The handle is a labelled button with visible focus.

## Visual states

Neutral below limit, amber at limit, red over limit, and active-drag handle states apply.

## Composition

Rendered by Column.

## Edge cases

Zero limit, long name, and large counts.

## Open questions

Column action controls arrive with CRUD UI.
