# production-serving

**File:** `server/src/index.ts`  
**Status:** implemented

## Purpose

Serve the built Vite frontend from the same Express process in production while preserving API routing.

## Public interface

Non-API GET requests serve `web/dist/index.html`; hashed assets receive immutable cache headers.

## Data access

Reads static files only; SQLite remains owned by the server bootstrap.

## Transaction boundaries

Not applicable.

## Validation

Production serving is enabled only when `NODE_ENV=production` and the dist directory exists.

## Errors

Missing dist files fail startup with a readable deployment error.

## Invariants

`/api/*` and `/healthz` remain handled by Express API routes.

## Failure modes

Absent frontend build is reported; API availability is not masked by static fallback.

## Test cases

- Production build serves index and hashed assets.
- API and health paths remain JSON responses.
