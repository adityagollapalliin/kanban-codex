import {
  generatePositionBetween,
  type BoardHydrate,
  type MoveCardRequest,
  type UpdateColumnRequest,
} from '@kanban/shared';
import { arrayMove } from '@dnd-kit/sortable';

export type DragTarget =
  | { readonly type: 'card'; readonly id: string }
  | { readonly type: 'column'; readonly id: string };

export function moveCardPreview(
  board: BoardHydrate,
  cardId: string,
  target: DragTarget,
): BoardHydrate {
  const sourceColumn = board.columns.find((column) =>
    column.cards.some((card) => card.id === cardId),
  );
  const card = sourceColumn?.cards.find((item) => item.id === cardId);
  if (!sourceColumn || !card) return board;

  const targetColumn =
    target.type === 'column'
      ? board.columns.find((column) => column.id === target.id)
      : board.columns.find((column) =>
          column.cards.some((item) => item.id === target.id),
        );
  if (!targetColumn || target.id === cardId) return board;
  const sourceIndex = sourceColumn.cards.findIndex(
    (item) => item.id === cardId,
  );
  const originalTargetIndex =
    target.type === 'card'
      ? targetColumn.cards.findIndex((item) => item.id === target.id)
      : targetColumn.cards.length;

  const columnsWithoutCard = board.columns.map((column) => ({
    ...column,
    cards: column.cards.filter((item) => item.id !== cardId),
  }));
  const destination = columnsWithoutCard.find(
    (column) => column.id === targetColumn.id,
  );
  if (!destination) return board;
  const targetIndex =
    target.type === 'column'
      ? destination.cards.length
      : Math.max(
          0,
          destination.cards.findIndex((item) => item.id === target.id),
        ) +
        (sourceColumn.id === targetColumn.id &&
        sourceIndex < originalTargetIndex
          ? 1
          : 0);
  const previous = destination.cards[targetIndex - 1]?.position ?? null;
  const next = destination.cards[targetIndex]?.position ?? null;
  const movedCard = {
    ...card,
    columnId: destination.id,
    position: generatePositionBetween(previous, next),
  };
  const cards = [...destination.cards];
  cards.splice(targetIndex, 0, movedCard);
  return {
    ...board,
    columns: columnsWithoutCard.map((column) =>
      column.id === destination.id ? { ...column, cards } : column,
    ),
  };
}

export function cardMoveRequest(
  board: BoardHydrate,
  cardId: string,
): MoveCardRequest | null {
  const column = board.columns.find((item) =>
    item.cards.some((card) => card.id === cardId),
  );
  if (!column) return null;
  const index = column.cards.findIndex((card) => card.id === cardId);
  return {
    toColumnId: column.id,
    prevCardId: column.cards[index - 1]?.id ?? null,
    nextCardId: column.cards[index + 1]?.id ?? null,
  };
}

export function moveColumnPreview(
  board: BoardHydrate,
  columnId: string,
  overColumnId: string,
): BoardHydrate {
  const from = board.columns.findIndex((column) => column.id === columnId);
  const to = board.columns.findIndex((column) => column.id === overColumnId);
  if (from < 0 || to < 0 || from === to) return board;
  const columns = arrayMove(board.columns, from, to).map(
    (column, index, all) =>
      column.id === columnId
        ? {
            ...column,
            position: generatePositionBetween(
              all[index - 1]?.position ?? null,
              all[index + 1]?.position ?? null,
            ),
          }
        : column,
  );
  return { ...board, columns };
}

export function columnMoveRequest(
  board: BoardHydrate,
  columnId: string,
): UpdateColumnRequest | null {
  const index = board.columns.findIndex((column) => column.id === columnId);
  if (index < 0) return null;
  return {
    prevColumnId: board.columns[index - 1]?.id ?? null,
    nextColumnId: board.columns[index + 1]?.id ?? null,
  };
}

export function sameMove(
  left: MoveCardRequest | UpdateColumnRequest | null,
  right: MoveCardRequest | UpdateColumnRequest | null,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
