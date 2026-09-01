import { useEffect, useRef, useState } from 'react';
import type {
  BoardHydrate,
  Card,
  Label,
  UpdateCardRequest,
} from '@kanban/shared';
import { useQueryClient } from '@tanstack/react-query';

import { boardQueryKey } from '../../api/board.js';
import {
  optimisticCardPatch,
  useUpdateCardMutation,
} from '../../api/card-mutations.js';
import { Checklist } from './Checklist.js';
import { LabelEditor } from './LabelEditor.js';

interface Props {
  readonly card: Card;
  readonly labels: readonly Label[];
  readonly onArchive: () => void;
  readonly onClose: () => void;
  readonly onError: (message: string) => void;
}

export function CardDrawer({
  card,
  labels,
  onArchive,
  onClose,
  onError,
}: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [dueDate, setDueDate] = useState(card.dueDate?.slice(0, 10) ?? '');
  const update = useUpdateCardMutation(onError);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
    setDueDate(card.dueDate?.slice(0, 10) ?? '');
    heading.current?.focus();
  }, [card]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  function save(patch: UpdateCardRequest) {
    const before = queryClient.getQueryData<BoardHydrate>(boardQueryKey);
    if (!before) return;
    update.mutate({
      cardId: card.id,
      patch,
      nextBoard: optimisticCardPatch(before, card.id, patch),
      rollbackBoard: before,
    });
  }

  return (
    <aside
      aria-labelledby="card-drawer-heading"
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      data-testid="card-drawer"
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2
          className="text-lg font-black outline-none"
          id="card-drawer-heading"
          ref={heading}
          tabIndex={-1}
        >
          Card details
        </h2>
        <button
          aria-label="Close card details"
          className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </header>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
        <label className="block space-y-1.5 text-sm font-semibold">
          Title
          <input
            aria-label="Card title"
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-base dark:border-slate-700"
            onBlur={() => {
              if (title.trim() && title.trim() !== card.title)
                save({ title: title.trim() });
            }}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            value={title}
          />
        </label>
        <label className="block space-y-1.5 text-sm font-semibold">
          Description (Markdown)
          <textarea
            aria-label="Card description"
            className="min-h-40 w-full resize-y rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-mono text-sm dark:border-slate-700"
            onBlur={() => {
              if (description !== card.description) save({ description });
            }}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
            placeholder="Write markdown…"
            value={description}
          />
        </label>
        <label className="block space-y-1.5 text-sm font-semibold">
          Due date
          <input
            aria-label="Card due date"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
            onChange={(event) => {
              const value = event.target.value;
              setDueDate(value);
              save({
                dueDate: value ? `${value}T23:59:59.000Z` : null,
              });
            }}
            type="date"
            value={dueDate}
          />
        </label>
        <section aria-labelledby="drawer-labels-heading" className="space-y-2">
          <h3 className="text-sm font-bold" id="drawer-labels-heading">
            Labels
          </h3>
          <LabelEditor
            labels={labels}
            onChange={(labelIds) => {
              save({ labelIds: [...labelIds] });
            }}
            selectedIds={card.labelIds}
          />
        </section>
        <Checklist
          cardId={card.id}
          items={card.checklistItems}
          onError={onError}
        />
      </div>
      <footer className="border-t border-slate-200 p-5 dark:border-slate-800">
        <button
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
          onClick={onArchive}
          type="button"
        >
          Archive card
        </button>
      </footer>
    </aside>
  );
}
