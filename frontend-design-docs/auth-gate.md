# AuthGate

**File:** `web/src/components/AuthGate.tsx`  
**Status:** implemented

## Purpose

Show the login form when the API requires authentication and render the app after a successful session. It does not store passwords or tokens.

## Props

| Prop     | Type        | Required | Description            |
| -------- | ----------- | -------- | ---------------------- |
| children | `ReactNode` | Yes      | Protected application. |

## State ownership

Login form fields and error state are local; the session is an httpOnly cookie owned by the server.

## Data dependencies

Calls `POST /api/auth/login`; a 401 from board hydration displays the form.

## Interactions

Submit sends the password, then invalidates the board query. Failed login stays on the form with an alert.

## Keyboard & accessibility

Password field and submit button are labelled; errors use `role="alert"`.

## Visual states

Loading, invalid password, and authenticated states apply.

## Composition

Wraps App's board content.

## Edge cases

Open mode skips the gate; password is never persisted in local storage.

## Open questions

None.
