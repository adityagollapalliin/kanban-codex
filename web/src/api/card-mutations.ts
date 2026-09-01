import {
  cardSchema,
  type CreateCardRequest,
  type BoardHydrate,
  type UpdateCardRequest,
} from '@kanban/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { boardQueryKey } from './board.js';
import { sendJson } from './client.js';
import { updateCardInBoard } from '../features/board/card-editing.js';

interface Variables {
  readonly cardId: string;
  readonly patch: UpdateCardRequest;
  readonly nextBoard: BoardHydrate;
  readonly rollbackBoard: BoardHydrate;
}

export function useUpdateCardMutation(onError: (message: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, patch }: Variables) =>
      sendJson(`/api/cards/${cardId}`, 'PATCH', patch, cardSchema),
    onMutate: async ({ nextBoard }) => {
      await queryClient.cancelQueries({ queryKey: boardQueryKey });
      queryClient.setQueryData(boardQueryKey, nextBoard);
    },
    onError: (error, { rollbackBoard }) => {
      queryClient.setQueryData(boardQueryKey, rollbackBoard);
      onError(error instanceof Error ? error.message : 'Card update failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardQueryKey }),
  });
}

export function useCreateCardMutation(onError: (message: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCardRequest) =>
      sendJson('/api/cards', 'POST', input, cardSchema),
    onError: (error) => {
      onError(error instanceof Error ? error.message : 'Card creation failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardQueryKey }),
  });
}

export function optimisticCardPatch(
  board: BoardHydrate,
  cardId: string,
  patch: UpdateCardRequest,
): BoardHydrate {
  if (patch.archived === true) {
    return updateCardInBoard(board, cardId, () => null);
  }
  return updateCardInBoard(board, cardId, (card) => ({
    ...card,
    ...(patch.title === undefined ? {} : { title: patch.title }),
    ...(patch.description === undefined
      ? {}
      : { description: patch.description }),
    ...(patch.dueDate === undefined ? {} : { dueDate: patch.dueDate }),
    ...(patch.labelIds === undefined ? {} : { labelIds: [...patch.labelIds] }),
    ...(patch.archived === undefined
      ? {}
      : { archivedAt: patch.archived ? new Date().toISOString() : null }),
  }));
}
