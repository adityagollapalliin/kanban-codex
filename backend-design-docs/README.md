# Backend design documents

| Document                                                | Purpose                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| [app](./app.md)                                         | Express application composition and health endpoint.           |
| [auth service](./auth-service.md)                       | Signed sessions and authentication middleware.                 |
| [auth routes](./auth-routes.md)                         | Rate-limited password login endpoint.                          |
| [API contract](./_api-contract.md)                      | Shared request, response, entity, and dump schemas.            |
| [board service](./board-service.md)                     | Full board hydration.                                          |
| [board routes](./board-routes.md)                       | Board hydrate HTTP adapter.                                    |
| [columns service](./columns-service.md)                 | Column CRUD and ordering.                                      |
| [columns routes](./columns-routes.md)                   | Column HTTP adapters.                                          |
| [cards service](./cards-service.md)                     | Card lifecycle, labels, archive, and moves.                    |
| [cards routes](./cards-routes.md)                       | Card HTTP adapters.                                            |
| [checklist items service](./checklist-items-service.md) | Checklist CRUD.                                                |
| [checklist items routes](./checklist-items-routes.md)   | Checklist HTTP adapters.                                       |
| [client](./client.md)                                   | SQLite connection creation, durability settings, and closure.  |
| [config](./config.md)                                   | Environment parsing and startup validation.                    |
| [data model](./_data-model.md)                          | Phase 2 tables, relationships, indexes, and migration policy.  |
| [error model](./_error-model.md)                        | Error codes and HTTP mappings.                                 |
| [error handler](./error-handler.md)                     | Safe Express error serialization.                              |
| [export/import service](./export-import-service.md)     | Complete dump and atomic replacement.                          |
| [export/import routes](./export-import-routes.md)       | Export and import HTTP adapters.                               |
| [index](./index.md)                                     | Process bootstrap and graceful HTTP shutdown.                  |
| [logger](./logger.md)                                   | Structured application logging.                                |
| [migration runner](./migration-runner.md)               | Sequential discovery and atomic application of SQL migrations. |
| [ordering](./_ordering.md)                              | Fractional-key rules shared by client and server.              |
| [ordering service](./ordering.md)                       | Atomic card movement and column-key rebalancing.               |
| [request-context](./request-context.md)                 | Request IDs and request completion logs.                       |
| [seed](./seed.md)                                       | Idempotent creation of a local demonstration board.            |

Only modules implemented or being designed in the current phase are indexed. Future phases may add additional modules.
