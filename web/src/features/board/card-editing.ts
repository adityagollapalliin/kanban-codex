import type { BoardHydrate, Card, ChecklistItem } from '@kanban/shared';

export function updateCardInBoard(
  board: BoardHydrate,
  cardId: string,
  update: (card: Card) => Card | null,
): BoardHydrate {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.flatMap((card) => {
        if (card.id !== cardId) return [card];
        const next = update(card);
        return next ? [next] : [];
      }),
    })),
  };
}

export function updateChecklistInBoard(
  board: BoardHydrate,
  cardId: string,
  itemId: string,
  update: (item: ChecklistItem) => ChecklistItem | null,
): BoardHydrate {
  return updateCardInBoard(board, cardId, (card) => ({
    ...card,
    checklistItems: card.checklistItems.flatMap((item) => {
      if (item.id !== itemId) return [item];
      const next = update(item);
      return next ? [next] : [];
    }),
  }));
}
