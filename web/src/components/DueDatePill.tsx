interface DueDatePillProps {
  readonly dueDate: string;
  readonly now?: Date;
}
const DAY_MS = 86_400_000;

export function DueDatePill({ dueDate, now = new Date() }: DueDatePillProps) {
  const due = new Date(dueDate);
  const remaining = due.getTime() - now.getTime();
  const state =
    remaining < 0 ? 'overdue' : remaining <= DAY_MS ? 'soon' : 'normal';
  const tone =
    state === 'overdue'
      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
      : state === 'soon'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return (
    <time
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}
      dateTime={dueDate}
    >
      {state === 'overdue' ? 'Overdue' : 'Due'}{' '}
      {new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
      }).format(due)}
    </time>
  );
}
