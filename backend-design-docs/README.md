# Backend design documents

| Document                                  | Purpose                                                        |
| ----------------------------------------- | -------------------------------------------------------------- |
| [app](./app.md)                           | Express application composition and health endpoint.           |
| [client](./client.md)                     | SQLite connection creation, durability settings, and closure.  |
| [config](./config.md)                     | Environment parsing and startup validation.                    |
| [data model](./_data-model.md)            | Phase 2 tables, relationships, indexes, and migration policy.  |
| [index](./index.md)                       | Process bootstrap and graceful HTTP shutdown.                  |
| [logger](./logger.md)                     | Structured application logging.                                |
| [migration runner](./migration-runner.md) | Sequential discovery and atomic application of SQL migrations. |
| [request-context](./request-context.md)   | Request IDs and request completion logs.                       |
| [seed](./seed.md)                         | Idempotent creation of a local demonstration board.            |

Only modules implemented or being designed in the current phase are indexed. Auth, service, and route documents are added before their corresponding implementation phases.
