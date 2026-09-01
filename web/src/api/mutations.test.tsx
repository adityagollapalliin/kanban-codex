import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { BoardHydrate } from '@kanban/shared';

import { boardQueryKey } from './board.js';
import { useMoveCardMutation } from './mutations.js';

const TIME = '2026-01-01T00:00:00.000Z';
const original: BoardHydrate = {
  board: { id: 'board', name: 'Board', createdAt: TIME, updatedAt: TIME },
  labels: [],
  columns: [
    {
      id: 'a',
      boardId: 'board',
      name: 'A',
      position: 'a0',
      wipLimit: null,
      createdAt: TIME,
      updatedAt: TIME,
      cards: [],
    },
  ],
};
const optimistic: BoardHydrate = {
  ...original,
  columns: [
    {
      id: 'a',
      boardId: 'board',
      name: 'Optimistic',
      position: 'a0',
      wipLimit: null,
      createdAt: TIME,
      updatedAt: TIME,
      cards: [],
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('move mutations', () => {
  it('keeps the optimistic board through a successful request', async () => {
    const queryClient = createClient();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              id: 'card',
              columnId: 'a',
              title: 'Card',
              description: '',
              position: 'a0',
              dueDate: null,
              archivedAt: null,
              createdAt: TIME,
              updatedAt: TIME,
              labelIds: [],
              checklistItems: [],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        ),
      ),
    );
    const { result } = renderMoveHook(queryClient);
    act(() => {
      result.current.mutate(moveVariables());
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(queryClient.getQueryData(boardQueryKey)).toEqual(optimistic);
  });

  it('restores the exact snapshot and reports a rejected request', async () => {
    const queryClient = createClient();
    const onError = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              error: { code: 'NEIGHBOR_CONFLICT', message: 'Stale' },
            }),
            { status: 409, headers: { 'Content-Type': 'application/json' } },
          ),
        ),
      ),
    );
    const { result } = renderMoveHook(queryClient, onError);
    act(() => {
      result.current.mutate(moveVariables());
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(queryClient.getQueryData(boardQueryKey)).toEqual(original);
    expect(onError).toHaveBeenCalledWith('Stale');
  });
});

function createClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(boardQueryKey, original);
  return queryClient;
}

function renderMoveHook(queryClient: QueryClient, onError = vi.fn()) {
  function Wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return renderHook(() => useMoveCardMutation({ onError }), {
    wrapper: Wrapper,
  });
}

function moveVariables() {
  return {
    cardId: 'card',
    input: { toColumnId: 'a', prevCardId: null, nextCardId: null },
    nextBoard: optimistic,
    rollbackBoard: original,
  };
}
