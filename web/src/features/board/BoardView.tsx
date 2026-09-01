import { useRef, useState } from 'react';
import type { BoardHydrate } from '@kanban/shared';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';

import { useBoardQuery } from '../../api/board.js';
import { boardQueryKey } from '../../api/board.js';
import {
  useMoveCardMutation,
  useMoveColumnMutation,
} from '../../api/mutations.js';
import { DragErrorToast } from '../../components/DragErrorToast.js';
import { BoardSkeleton } from '../../components/BoardSkeleton.js';
import { Column } from './Column.js';
import { DragOverlayCard } from './DragOverlayCard.js';
import {
  cardMoveRequest,
  columnMoveRequest,
  moveCardPreview,
  moveColumnPreview,
  sameMove,
  type DragTarget,
} from './drag-state.js';

interface ActiveDrag {
  readonly id: string;
  readonly kind: 'card' | 'column';
  readonly title: string;
}

export function BoardView() {
  const query = useBoardQuery();
  const queryClient = useQueryClient();
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const initialBoard = useRef<BoardHydrate | null>(null);
  const moveCard = useMoveCardMutation({ onError: setMoveError });
  const moveColumn = useMoveColumnMutation({ onError: setMoveError });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  if (!query.data) return <BoardSkeleton />;
  const { board, columns, labels } = query.data;
  const labelsById = new Map(labels.map((label) => [label.id, label]));

  function handleDragStart(event: DragStartEvent) {
    const kind = event.active.data.current?.type as
      ActiveDrag['kind'] | undefined;
    const id = event.active.data.current?.id as string | undefined;
    if (!kind || !id) return;
    initialBoard.current = queryClient.getQueryData(boardQueryKey) ?? null;
    const title =
      kind === 'column'
        ? columns.find((column) => column.id === id)?.name
        : columns
            .flatMap((column) => column.cards)
            .find((card) => card.id === id)?.title;
    setActiveDrag({ kind, id, title: title ?? 'Untitled' });
    setMoveError(null);
  }

  function targetFromEvent(event: DragOverEvent | DragEndEvent) {
    const type = event.over?.data.current?.type as
      DragTarget['type'] | undefined;
    const id = event.over?.data.current?.id as string | undefined;
    return type && id ? ({ type, id } as DragTarget) : null;
  }

  function handleDragOver(event: DragOverEvent) {
    if (activeDrag?.kind !== 'card') return;
    const target = targetFromEvent(event);
    if (!target) return;
    queryClient.setQueryData<BoardHydrate>(boardQueryKey, (current) =>
      current ? moveCardPreview(current, activeDrag.id, target) : current,
    );
  }

  function restoreDragSnapshot() {
    if (initialBoard.current) {
      queryClient.setQueryData(boardQueryKey, initialBoard.current);
    }
    initialBoard.current = null;
    setActiveDrag(null);
  }

  function handleDragCancel(_event: DragCancelEvent) {
    restoreDragSnapshot();
  }

  function handleDragEnd(event: DragEndEvent) {
    const active = activeDrag;
    const rollbackBoard = initialBoard.current;
    const target = targetFromEvent(event);
    if (!active || !rollbackBoard || !target) {
      restoreDragSnapshot();
      return;
    }
    if (active.kind === 'card') {
      const nextBoard =
        queryClient.getQueryData<BoardHydrate>(boardQueryKey) ?? rollbackBoard;
      const before = cardMoveRequest(rollbackBoard, active.id);
      const input = cardMoveRequest(nextBoard, active.id);
      setActiveDrag(null);
      initialBoard.current = null;
      if (input && !sameMove(before, input)) {
        moveCard.mutate({ cardId: active.id, input, nextBoard, rollbackBoard });
      } else {
        queryClient.setQueryData(boardQueryKey, rollbackBoard);
      }
      return;
    }
    if (target.type !== 'column') {
      restoreDragSnapshot();
      return;
    }
    const nextBoard = moveColumnPreview(rollbackBoard, active.id, target.id);
    const before = columnMoveRequest(rollbackBoard, active.id);
    const input = columnMoveRequest(nextBoard, active.id);
    setActiveDrag(null);
    initialBoard.current = null;
    if (input && !sameMove(before, input)) {
      moveColumn.mutate({
        columnId: active.id,
        input,
        nextBoard,
        rollbackBoard,
      });
    } else {
      queryClient.setQueryData(boardQueryKey, rollbackBoard);
    }
  }

  return (
    <main
      aria-labelledby="board-title"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="px-6 pb-4">
        <h1
          className="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-white"
          id="board-title"
        >
          {board.name}
        </h1>
      </div>
      {columns.length === 0 ? (
        <section className="mx-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          This board has no columns yet.
        </section>
      ) : (
        <DndContext
          accessibility={{
            announcements: {
              onDragStart: ({ active }) =>
                `Picked up ${String(active.data.current?.type)} ${String(active.data.current?.id)}.`,
              onDragOver: ({ over }) =>
                over
                  ? `Moved over ${String(over.data.current?.id)}.`
                  : undefined,
              onDragEnd: ({ over }) =>
                over
                  ? `Dropped at ${String(over.data.current?.id)}.`
                  : 'Drop cancelled.',
              onDragCancel: () => 'Move cancelled.',
            },
          }}
          collisionDetection={closestCorners}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <SortableContext
            items={columns.map((column) => `column:${column.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div
              aria-label="Board columns"
              className="flex min-h-0 flex-1 gap-4 overflow-x-auto px-6 pb-6"
            >
              {columns.map((column) => (
                <Column
                  column={column}
                  key={column.id}
                  labelsById={labelsById}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeDrag && (
              <DragOverlayCard
                kind={activeDrag.kind}
                title={activeDrag.title}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}
      <DragErrorToast
        message={moveError}
        onDismiss={() => {
          setMoveError(null);
        }}
      />
    </main>
  );
}
