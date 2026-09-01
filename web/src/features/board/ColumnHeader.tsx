interface Props {
  readonly count: number;
  readonly id: string;
  readonly name: string;
  readonly wipLimit: number | null;
}

export function ColumnHeader({ count, id, name, wipLimit }: Props) {
  const state =
    wipLimit === null
      ? 'normal'
      : count > wipLimit
        ? 'over'
        : count === wipLimit
          ? 'limit'
          : 'normal';
  const tone =
    state === 'over'
      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
      : state === 'limit'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200';
  const countText =
    wipLimit === null
      ? String(count)
      : `${String(count)} / ${String(wipLimit)}`;
  const status =
    state === 'over'
      ? ', over WIP limit'
      : state === 'limit'
        ? ', at WIP limit'
        : '';
  return (
    <header className="flex items-center justify-between gap-3 px-1 pb-3">
      <h2
        className="truncate text-sm font-bold text-slate-900 dark:text-slate-100"
        id={id}
        title={name}
      >
        {name}
      </h2>
      <span
        aria-label={`${countText}${status}`}
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${tone}`}
      >
        {countText}
      </span>
    </header>
  );
}
