interface Props {
  readonly kind: 'card' | 'column';
  readonly title: string;
}

export function DragOverlayCard({ kind, title }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`${kind === 'column' ? 'w-80' : 'w-72'} pointer-events-none rotate-1 truncate rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-2xl dark:border-blue-700 dark:bg-slate-800 dark:text-white`}
    >
      {title}
    </div>
  );
}
