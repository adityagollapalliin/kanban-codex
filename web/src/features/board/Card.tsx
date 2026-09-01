import type { Card as CardData, Label } from '@kanban/shared';
import { useSortable } from '@dnd-kit/sortable';

import { DueDatePill } from '../../components/DueDatePill.js';
import { LabelChip } from '../../components/LabelChip.js';

interface Props {
  readonly card: CardData;
  readonly labelsById: ReadonlyMap<string, Label>;
}

export function Card({ card, labelsById }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card:${card.id}`,
    data: { type: 'card', id: card.id },
  });
  const labels = card.labelIds.flatMap((id) => {
    const label = labelsById.get(id);
    return label ? [label] : [];
  });
  const done = card.checklistItems.filter((item) => item.done).length;
  return (
    <article
      {...attributes}
      {...listeners}
      aria-label={`Card: ${card.title}`}
      className={`touch-none rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800 ${isDragging ? 'opacity-30' : ''}`}
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${String(transform.x)}px, ${String(transform.y)}px, 0) scaleX(${String(transform.scaleX)}) scaleY(${String(transform.scaleY)})`
          : undefined,
        transition,
      }}
    >
      <h3 className="wrap-break-word text-sm leading-5 font-semibold text-slate-900 dark:text-slate-100">
        {card.title}
      </h3>
      {labels.length > 0 && (
        <div aria-label="Labels" className="mt-2 flex flex-wrap gap-1.5">
          {labels.map((label) => (
            <LabelChip key={label.id} label={label} />
          ))}
        </div>
      )}
      {(card.dueDate !== null || card.checklistItems.length > 0) && (
        <footer className="mt-3 flex flex-wrap items-center gap-2">
          {card.dueDate && <DueDatePill dueDate={card.dueDate} />}
          {card.checklistItems.length > 0 && (
            <span
              aria-label={`${String(done)} of ${String(card.checklistItems.length)} checklist items complete`}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
              {done}/{card.checklistItems.length}
            </span>
          )}
        </footer>
      )}
    </article>
  );
}
