import type { ButtonHTMLAttributes } from 'react';

interface Props {
  readonly count: number;
  readonly id: string;
  readonly name: string;
  readonly wipLimit: number | null;
  readonly dragHandleProps: ButtonHTMLAttributes<HTMLButtonElement>;
}

export function ColumnHeader({
  count,
  dragHandleProps,
  id,
  name,
  wipLimit,
}: Props) {
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
      <div className="flex min-w-0 items-center gap-1">
        <button
          {...dragHandleProps}
          aria-label={`Move column ${name}`}
          className="touch-none rounded-md px-1 py-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          type="button"
        >
          ⠿
        </button>
        <h2
          className="truncate text-sm font-bold text-slate-900 dark:text-slate-100"
          id={id}
          title={name}
        >
          {name}
        </h2>
      </div>
      <span
        aria-label={`${countText}${status}`}
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${tone}`}
      >
        {countText}
      </span>
    </header>
  );
}
