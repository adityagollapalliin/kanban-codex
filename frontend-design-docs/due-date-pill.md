# DueDatePill

**File:** `web/src/components/DueDatePill.tsx`  
**Status:** implemented

## Purpose

Format an ISO due date and convey normal, due-within-24-hours, or overdue urgency.

## Props

| Prop    | Type     | Required | Description               |
| ------- | -------- | -------- | ------------------------- |
| dueDate | `string` | Yes      | ISO timestamp.            |
| now     | `Date`   | No       | Deterministic test clock. |

## State ownership

None; urgency is derived.

## Data dependencies

None.

## Interactions

None.

## Keyboard & accessibility

`time` carries `dateTime`; text includes “Due” or “Overdue,” not color alone.

## Visual states

Neutral beyond 24 hours, amber within 24 hours, red overdue. Other states are not applicable.

## Composition

Rendered by Card.

## Edge cases

Timezone formatting uses the browser locale; invalid dates are prevented by API validation.

## Open questions

None.
