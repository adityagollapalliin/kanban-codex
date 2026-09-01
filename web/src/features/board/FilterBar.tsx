import type { Label } from '@kanban/shared';
import type { RefObject } from 'react';

export interface BoardFilter {
  readonly labelId: string;
  readonly overdueOnly: boolean;
  readonly text: string;
}

interface Props {
  readonly labels: readonly Label[];
  readonly onChange: (value: BoardFilter) => void;
  readonly searchRef: RefObject<HTMLInputElement | null>;
  readonly value: BoardFilter;
}

export function FilterBar({ labels, onChange, searchRef, value }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
      <input
        aria-label="Search cards"
        className="min-w-48 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        onChange={(event) => {
          onChange({ ...value, text: event.target.value });
        }}
        placeholder="Search cards…"
        ref={searchRef}
        type="search"
        value={value.text}
      />
      <select
        aria-label="Filter by label"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        onChange={(event) => {
          onChange({ ...value, labelId: event.target.value });
        }}
        value={value.labelId}
      >
        <option value="">All labels</option>
        {labels.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          checked={value.overdueOnly}
          className="size-4 accent-sky-600"
          onChange={(event) => {
            onChange({ ...value, overdueOnly: event.target.checked });
          }}
          type="checkbox"
        />
        Overdue only
      </label>
    </div>
  );
}
