import { boardHydrateSchema } from '@kanban/shared';
import { useQuery } from '@tanstack/react-query';

import { getJson } from './client.js';

export const boardQueryKey = ['board'] as const;

export function useBoardQuery() {
  return useQuery({
    queryKey: boardQueryKey,
    queryFn: () => getJson('/api/board', boardHydrateSchema),
    staleTime: 60_000,
    throwOnError: true,
  });
}
