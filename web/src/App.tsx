import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { BoardErrorBoundary } from './components/BoardErrorBoundary.js';
import { BoardView } from './features/board/BoardView.js';

export function App() {
  return (
    <div className="flex h-dvh min-w-80 flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center gap-3 px-6 py-4">
        <span aria-hidden="true" className="size-3 rounded bg-sky-500" />
        <span className="text-sm font-extrabold tracking-wide">KANBAN</span>
      </header>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <BoardErrorBoundary onReset={reset}>
            <BoardView />
          </BoardErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  );
}
