import type { Label } from '@kanban/shared';

interface Props {
  readonly labels: readonly Label[];
  readonly selectedIds: readonly string[];
  readonly onChange: (ids: readonly string[]) => void;
}

export function LabelEditor({ labels, onChange, selectedIds }: Props) {
  const selected = new Set(selectedIds);
  if (labels.length === 0)
    return <p className="text-sm text-slate-500">No labels on this board.</p>;
  return (
    <div aria-label="Card labels" className="flex flex-wrap gap-2">
      {labels.map((label) => {
        const checked = selected.has(label.id);
        return (
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${checked ? 'border-sky-400 bg-sky-50 dark:bg-sky-950' : 'border-slate-200 dark:border-slate-700'}`}
            key={label.id}
          >
            <input
              checked={checked}
              className="size-3 accent-sky-600"
              onChange={() => {
                const next = checked
                  ? selectedIds.filter((id) => id !== label.id)
                  : [...selectedIds, label.id];
                onChange(next);
              }}
              type="checkbox"
            />
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: label.color }}
            />
            {label.name}
          </label>
        );
      })}
    </div>
  );
}
