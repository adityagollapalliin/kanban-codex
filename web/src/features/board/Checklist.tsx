import { useState } from 'react';
import type { BoardHydrate, ChecklistItem } from '@kanban/shared';
import { useQueryClient } from '@tanstack/react-query';

import { boardQueryKey } from '../../api/board.js';
import {
  useCreateChecklistMutation,
  useDeleteChecklistMutation,
  useUpdateChecklistMutation,
} from '../../api/checklist-mutations.js';
import { updateCardInBoard, updateChecklistInBoard } from './card-editing.js';

interface Props {
  readonly cardId: string;
  readonly items: readonly ChecklistItem[];
  readonly onError: (message: string) => void;
}

export function Checklist({ cardId, items, onError }: Props) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();
  const create = useCreateChecklistMutation(onError);
  const update = useUpdateChecklistMutation(onError);
  const remove = useDeleteChecklistMutation(onError);

  function currentBoard(): BoardHydrate | null {
    return queryClient.getQueryData<BoardHydrate>(boardQueryKey) ?? null;
  }
  function addItem() {
    const value = text.trim();
    const before = currentBoard();
    if (!value || !before) return;
    const optimistic: ChecklistItem = {
      id: `optimistic-${String(Date.now())}`,
      cardId,
      text: value,
      done: false,
      position: `z${String(items.length)}`,
    };
    const nextBoard = updateCardInBoard(before, cardId, (card) => ({
      ...card,
      checklistItems: [...card.checklistItems, optimistic],
    }));
    create.mutate({
      input: { cardId, text: value },
      nextBoard,
      rollbackBoard: before,
    });
    setText('');
  }
  function toggle(item: ChecklistItem) {
    const before = currentBoard();
    if (!before) return;
    update.mutate({
      itemId: item.id,
      input: { done: !item.done },
      nextBoard: updateChecklistInBoard(before, cardId, item.id, (value) => ({
        ...value,
        done: !value.done,
      })),
      rollbackBoard: before,
    });
  }
  function edit(item: ChecklistItem, value: string) {
    const trimmed = value.trim();
    const before = currentBoard();
    if (!trimmed || trimmed === item.text || !before) return;
    update.mutate({
      itemId: item.id,
      input: { text: trimmed },
      nextBoard: updateChecklistInBoard(before, cardId, item.id, (current) => ({
        ...current,
        text: trimmed,
      })),
      rollbackBoard: before,
    });
  }
  function deleteItem(item: ChecklistItem) {
    const before = currentBoard();
    if (!before) return;
    remove.mutate({
      itemId: item.id,
      nextBoard: updateChecklistInBoard(before, cardId, item.id, () => null),
      rollbackBoard: before,
    });
  }
  return (
    <section aria-labelledby="checklist-heading" className="space-y-3">
      <h3 className="text-sm font-bold" id="checklist-heading">
        Checklist
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li className="flex items-center gap-2" key={item.id}>
            <input
              aria-label={`Complete ${item.text}`}
              checked={item.done}
              className="size-4 accent-sky-600"
              onChange={() => {
                toggle(item);
              }}
              type="checkbox"
            />
            <input
              aria-label={`Edit ${item.text}`}
              className={`min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm focus:border-sky-400 focus:outline-none ${item.done ? 'text-slate-400 line-through' : ''}`}
              defaultValue={item.text}
              onBlur={(event) => {
                edit(item, event.currentTarget.value);
              }}
            />
            <button
              aria-label={`Delete ${item.text}`}
              className="rounded px-1 text-slate-400 hover:text-red-600"
              onClick={() => {
                deleteItem(item);
              }}
              type="button"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          addItem();
        }}
      >
        <input
          aria-label="New checklist item"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-transparent px-2 py-1.5 text-sm dark:border-slate-700"
          onChange={(event) => {
            setText(event.target.value);
          }}
          placeholder="Add an item"
          value={text}
        />
        <button
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-slate-900"
          disabled={!text.trim()}
          type="submit"
        >
          Add
        </button>
      </form>
    </section>
  );
}
