import {
  checklistItemSchema,
  deletedResponseSchema,
  type BoardHydrate,
  type CreateChecklistItemRequest,
  type UpdateChecklistItemRequest,
} from '@kanban/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { boardQueryKey } from './board.js';
import { sendJson } from './client.js';

interface BaseVariables {
  readonly nextBoard: BoardHydrate;
  readonly rollbackBoard: BoardHydrate;
}
interface CreateVariables extends BaseVariables {
  readonly input: CreateChecklistItemRequest;
}
interface UpdateVariables extends BaseVariables {
  readonly itemId: string;
  readonly input: UpdateChecklistItemRequest;
}
interface DeleteVariables extends BaseVariables {
  readonly itemId: string;
}

function useOptimisticMutation<TVariables extends BaseVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  onError: (message: string) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async ({ nextBoard }) => {
      await queryClient.cancelQueries({ queryKey: boardQueryKey });
      queryClient.setQueryData(boardQueryKey, nextBoard);
    },
    onError: (error, { rollbackBoard }) => {
      queryClient.setQueryData(boardQueryKey, rollbackBoard);
      onError(
        error instanceof Error ? error.message : 'Checklist update failed',
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardQueryKey }),
  });
}

export function useCreateChecklistMutation(onError: (message: string) => void) {
  return useOptimisticMutation<CreateVariables>(
    ({ input }) =>
      sendJson('/api/checklist-items', 'POST', input, checklistItemSchema),
    onError,
  );
}

export function useUpdateChecklistMutation(onError: (message: string) => void) {
  return useOptimisticMutation<UpdateVariables>(
    ({ itemId, input }) =>
      sendJson(
        `/api/checklist-items/${itemId}`,
        'PATCH',
        input,
        checklistItemSchema,
      ),
    onError,
  );
}

export function useDeleteChecklistMutation(onError: (message: string) => void) {
  return useOptimisticMutation<DeleteVariables>(
    ({ itemId }) =>
      sendJson(
        `/api/checklist-items/${itemId}`,
        'DELETE',
        {},
        deletedResponseSchema,
      ),
    onError,
  );
}
