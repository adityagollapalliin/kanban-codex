import { useEffect } from 'react';

interface Props {
  readonly cardTitle: string;
  readonly onExpire: () => void;
  readonly onUndo: () => void;
}

export function UndoToast({ cardTitle, onExpire, onUndo }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onExpire, 8_000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [onExpire]);
  return (
    <aside
      className="fixed right-5 bottom-5 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl"
      role="status"
    >
      <span>Archived “{cardTitle}”.</span>
      <button
        className="rounded bg-white/15 px-2 py-1 hover:bg-white/25"
        onClick={onUndo}
        type="button"
      >
        Undo
      </button>
    </aside>
  );
}
