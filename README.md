# Kanban

Single-user, self-hosted Kanban board backed by SQLite.

## Run locally

Requires Node 22+. Copy `.env.example` to `.env`, then run:

```sh
npm install
npm run migrate
npm run seed
npm run dev
```

The app is served at `http://localhost:5173` in development. `npm start` serves the production build on `PORT` (default `3000`).

## Configuration

`PORT`, `DATABASE_PATH`, and `NODE_ENV` control the server. Leave `AUTH_PASSWORD_HASH` empty for localhost-only open mode. To enable login, run `npm run set-password -- 'your password'`, set the printed value as `AUTH_PASSWORD_HASH`, and set a random `SESSION_SECRET` of at least 32 characters.

## Backup and restore

Run `npm run backup` to create a timestamped SQLite file under `backups/`. Restore by stopping the server and replacing the configured database file with a backup, then run `npm run migrate` before restarting. The web Export/Import controls provide a portable full-board JSON backup as well.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Docker deployment is available with `docker compose up --build`; the SQLite database is persisted in the `kanban-data` volume.
