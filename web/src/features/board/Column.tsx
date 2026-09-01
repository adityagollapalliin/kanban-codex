import type { HydratedColumn, Label } from '@kanban/shared';

import { Card } from './Card.js';
import { ColumnHeader } from './ColumnHeader.js';

interface Props {
  readonly column: HydratedColumn;
  readonly labelsById: ReadonlyMap<string, Label>;
}

export function Column({ column, labelsById }: Props) {
  const headingId = `column-${column.id}`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex h-full w-80 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-100/90 p-3 dark:border-slate-800 dark:bg-slate-900/80"
    >
      <ColumnHeader
        count={column.cards.length}
        id={headingId}
        name={column.name}
        wipLimit={column.wipLimit}
      />
      <div
        aria-label={`${column.name} cards`}
        className="min-h-0 flex-1 overflow-y-auto pr-1"
        tabIndex={0}
      >
        {column.cards.length === 0 ? (
          <div className="grid min-h-28 place-items-center rounded-xl border-2 border-dashed border-slate-300 px-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No cards yet. This will become a drop target.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {column.cards.map((card) => (
              <li key={card.id}>
                <Card card={card} labelsById={labelsById} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
