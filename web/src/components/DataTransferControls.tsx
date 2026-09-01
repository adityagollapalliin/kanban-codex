import { useRef, useState } from 'react';
import { importResultSchema } from '@kanban/shared';
import { useQueryClient } from '@tanstack/react-query';

import { boardQueryKey } from '../api/board.js';

interface Props {
  readonly onError: (message: string) => void;
}

export function DataTransferControls({ onError }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function exportBoard() {
    setBusy(true);
    try {
      const response = await fetch('/api/export', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'kanban-export.json';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      onError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setBusy(false);
    }
  }
  async function importBoard(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: await file.text(),
      });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error('Import failed');
      importResultSchema.parse(body);
      await queryClient.invalidateQueries({ queryKey: boardQueryKey });
    } catch (error: unknown) {
      onError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }
  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded-lg px-2 py-1 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
        disabled={busy}
        onClick={() => void exportBoard()}
        type="button"
      >
        Export
      </button>
      <button
        className="rounded-lg px-2 py-1 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
        disabled={busy}
        onClick={() => input.current?.click()}
        type="button"
      >
        {busy ? 'Working…' : 'Import'}
      </button>
      <input
        aria-label="Import board JSON"
        className="hidden"
        onChange={(event) => void importBoard(event.target.files?.[0])}
        ref={input}
        type="file"
        accept="application/json,.json"
      />
    </div>
  );
}
