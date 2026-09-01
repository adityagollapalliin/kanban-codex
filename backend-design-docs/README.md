# Backend design documents

| Document                                | Purpose                                              |
| --------------------------------------- | ---------------------------------------------------- |
| [app](./app.md)                         | Express application composition and health endpoint. |
| [config](./config.md)                   | Environment parsing and startup validation.          |
| [index](./index.md)                     | Process bootstrap and graceful HTTP shutdown.        |
| [logger](./logger.md)                   | Structured application logging.                      |
| [request-context](./request-context.md) | Request IDs and request completion logs.             |

Only modules implemented in the current phase are indexed. Data, auth, service, and route documents are added before their corresponding implementation phases.
