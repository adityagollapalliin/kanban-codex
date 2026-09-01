import type { Label } from '@kanban/shared';

export function LabelChip({ label }: { readonly label: Label }) {
  return (
    <span
      className="inline-flex min-w-0 max-w-32 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      title={label.name}
    >
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: label.color }}
      />
      <span className="truncate">{label.name}</span>
    </span>
  );
}
