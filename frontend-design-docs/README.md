# Frontend design documents

| Document                                        | Purpose                                                |
| ----------------------------------------------- | ------------------------------------------------------ |
| [App](./app.md)                                 | Provides the query boundary and top-level board shell. |
| [BoardErrorBoundary](./board-error-boundary.md) | Isolates board render/query failures and offers retry. |
| [BoardSkeleton](./board-skeleton.md)            | Shape-preserving board loading state.                  |
| [BoardView](./board-view.md)                    | Fetches and lays out the hydrated board.               |
| [Card](./card.md)                               | Read-only card summary.                                |
| [Column](./column.md)                           | Scrollable card lane and empty state.                  |
| [ColumnHeader](./column-header.md)              | Column title, count, and WIP status.                   |
| [DueDatePill](./due-date-pill.md)               | Accessible due-date urgency indicator.                 |
| [LabelChip](./label-chip.md)                    | Compact color-coded label.                             |
| [design system](./_design-system.md)            | Visual tokens, responsive layout, and dark-mode rules. |
| [state management](./_state-management.md)      | Query keys, cache shape, and error/reset policy.       |

Only implemented or currently designed frontend units are indexed. Mutation and drag-and-drop documents arrive in their implementation phases.
