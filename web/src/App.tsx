import { useState } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { BoardErrorBoundary } from './components/BoardErrorBoundary.js';
import { AuthGate } from './components/AuthGate.js';
import { DataTransferControls } from './components/DataTransferControls.js';
import { BoardView } from './features/board/BoardView.js';

export function App() {
  const [transferError, setTransferError] = useState<string | null>(null);
  return (
    <div className="flex h-dvh min-w-80 flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center gap-3 px-6 py-4">
        <span aria-hidden="true" className="size-3 rounded bg-sky-500" />
        <span className="text-sm font-extrabold tracking-wide">KANBAN</span>
        <div className="ml-auto">
          <DataTransferControls onError={setTransferError} />
        </div>
      </header>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <AuthGate>
            <BoardErrorBoundary onReset={reset}>
              <BoardView />
            </BoardErrorBoundary>
          </AuthGate>
        )}
      </QueryErrorResetBoundary>
      {transferError && (
        <p
          className="fixed right-5 bottom-5 z-50 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white"
          role="alert"
        >
          {transferError}
          <button
            aria-label="Dismiss transfer error"
            className="ml-3"
            onClick={() => {
              setTransferError(null);
            }}
            type="button"
          >
            ×
          </button>
        </p>
      )}
    </div>
  );
}
