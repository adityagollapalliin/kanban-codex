# Frontend design documents

| Document                                            | Purpose                                                |
| --------------------------------------------------- | ------------------------------------------------------ |
| [App](./app.md)                                     | Provides the query boundary and top-level board shell. |
| [AuthGate](./auth-gate.md)                          | Session login gate when auth is enabled.               |
| [BoardErrorBoundary](./board-error-boundary.md)     | Isolates board render/query failures and offers retry. |
| [BoardSkeleton](./board-skeleton.md)                | Shape-preserving board loading state.                  |
| [BoardView](./board-view.md)                        | Fetches and lays out the hydrated board.               |
| [Card](./card.md)                                   | Read-only card summary.                                |
| [Column](./column.md)                               | Scrollable card lane and empty state.                  |
| [ColumnHeader](./column-header.md)                  | Column title, count, and WIP status.                   |
| [CardDrawer](./card-drawer.md)                      | Right-side card detail and editing drawer.             |
| [Checklist](./checklist.md)                         | Card checklist editing.                                |
| [DueDatePill](./due-date-pill.md)                   | Accessible due-date urgency indicator.                 |
| [DragErrorToast](./drag-error-toast.md)             | Accessible rollback notification for failed moves.     |
| [DragOverlayCard](./drag-overlay-card.md)           | Decorative preview for an active draggable item.       |
| [DataTransferControls](./data-transfer-controls.md) | Full JSON export and import controls.                  |
| [LabelChip](./label-chip.md)                        | Compact color-coded label.                             |
| [LabelEditor](./label-editor.md)                    | Existing-label selection for a card.                   |
| [FilterBar](./filter-bar.md)                        | Local text, label, and overdue filtering.              |
| [drag and drop](./_drag-and-drop.md)                | Sensors, collision, announcements, and persistence.    |
| [design system](./_design-system.md)                | Visual tokens, responsive layout, and dark-mode rules. |
| [state management](./_state-management.md)          | Query keys, cache shape, and error/reset policy.       |
| [UndoToast](./undo-toast.md)                        | Eight-second archive undo action.                      |
| [ShortcutsOverlay](./shortcuts-overlay.md)          | Keyboard shortcut reference overlay.                   |
| [smoke test](./smoke-test.md)                       | Playwright production hydration smoke test.            |
| [keyboard map](./_keyboard-map.md)                  | Global shortcut scope and conflict rules.              |

Only implemented or currently designed frontend units are indexed. Future phases may add additional units.
