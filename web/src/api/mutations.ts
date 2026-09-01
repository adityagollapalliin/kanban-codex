import {
  cardSchema,
  columnSchema,
  type BoardHydrate,
  type MoveCardRequest,
  type UpdateColumnRequest,
} from '@kanban/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { boardQueryKey } from './board.js';
import { sendJson } from './client.js';

interface OptimisticMove {
  readonly nextBoard: BoardHydrate;
  readonly rollbackBoard: BoardHydrate;
}

interface CardMove extends OptimisticMove {
  readonly cardId: string;
  readonly input: MoveCardRequest;
}

interface ColumnMove extends OptimisticMove {
  readonly columnId: string;
  readonly input: UpdateColumnRequest;
}

interface Options {
  readonly onError: (message: string) => void;
}

export function useMoveCardMutation({ onError }: Options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, input }: CardMove) =>
      sendJson(`/api/cards/${cardId}/move`, 'POST', input, cardSchema),
    onMutate: async ({ nextBoard }) => {
      await queryClient.cancelQueries({ queryKey: boardQueryKey });
      queryClient.setQueryData(boardQueryKey, nextBoard);
    },
    onError: (error, { rollbackBoard }) => {
      queryClient.setQueryData(boardQueryKey, rollbackBoard);
      onError(error instanceof Error ? error.message : 'Card move failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardQueryKey }),
  });
}

export function useMoveColumnMutation({ onError }: Options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, input }: ColumnMove) =>
      sendJson(`/api/columns/${columnId}`, 'PATCH', input, columnSchema),
    onMutate: async ({ nextBoard }) => {
      await queryClient.cancelQueries({ queryKey: boardQueryKey });
      queryClient.setQueryData(boardQueryKey, nextBoard);
    },
    onError: (error, { rollbackBoard }) => {
      queryClient.setQueryData(boardQueryKey, rollbackBoard);
      onError(error instanceof Error ? error.message : 'Column move failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardQueryKey }),
  });
}
