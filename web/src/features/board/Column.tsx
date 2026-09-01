import type { HydratedColumn, Label } from '@kanban/shared';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Card } from './Card.js';
import { ColumnHeader } from './ColumnHeader.js';

interface Props {
  readonly column: HydratedColumn;
  readonly labelsById: ReadonlyMap<string, Label>;
}

export function Column({ column, labelsById }: Props) {
  const headingId = `column-${column.id}`;
  const sortable = useSortable({
    id: `column:${column.id}`,
    data: { type: 'column', id: column.id },
  });
  const drop = useDroppable({
    id: `card-container:${column.id}`,
    data: { type: 'column', id: column.id },
  });
  return (
    <section
      aria-labelledby={headingId}
      className={`flex h-full w-80 shrink-0 flex-col rounded-2xl border bg-slate-100/90 p-3 dark:bg-slate-900/80 ${drop.isOver ? 'border-blue-500 ring-2 ring-blue-400/30' : 'border-slate-200 dark:border-slate-800'} ${sortable.isDragging ? 'opacity-30' : ''}`}
      ref={sortable.setNodeRef}
      style={{
        transform: sortable.transform
          ? `translate3d(${String(sortable.transform.x)}px, ${String(sortable.transform.y)}px, 0) scaleX(${String(sortable.transform.scaleX)}) scaleY(${String(sortable.transform.scaleY)})`
          : undefined,
        transition: sortable.transition,
      }}
    >
      <ColumnHeader
        count={column.cards.length}
        dragHandleProps={{ ...sortable.attributes, ...sortable.listeners }}
        id={headingId}
        name={column.name}
        wipLimit={column.wipLimit}
      />
      <div
        aria-label={`${column.name} cards`}
        className="min-h-0 flex-1 overflow-y-auto pr-1"
        ref={drop.setNodeRef}
        tabIndex={0}
      >
        {column.cards.length === 0 ? (
          <div className="grid min-h-28 place-items-center rounded-xl border-2 border-dashed border-slate-300 px-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No cards yet. This will become a drop target.
          </div>
        ) : (
          <SortableContext
            items={column.cards.map((card) => `card:${card.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2.5">
              {column.cards.map((card) => (
                <li key={card.id}>
                  <Card card={card} labelsById={labelsById} />
                </li>
              ))}
            </ul>
          </SortableContext>
        )}
      </div>
    </section>
  );
}
