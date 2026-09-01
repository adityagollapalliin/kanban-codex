import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { BoardHydrate } from '@kanban/shared';

import { App } from '../../App.js';
import { DueDatePill } from '../../components/DueDatePill.js';

const TIME = '2026-01-01T00:00:00.000Z';
const hydrate: BoardHydrate = {
  board: { id: 'board', name: 'My Board', createdAt: TIME, updatedAt: TIME },
  labels: [
    { id: 'label', boardId: 'board', name: 'Important', color: '#336699' },
  ],
  columns: [
    {
      id: 'todo',
      boardId: 'board',
      name: 'To do',
      position: 'a0',
      wipLimit: 0,
      createdAt: TIME,
      updatedAt: TIME,
      cards: [
        {
          id: 'card',
          columnId: 'todo',
          title: 'Ship the board',
          description: '',
          position: 'a0',
          dueDate: '2099-01-02T00:00:00.000Z',
          archivedAt: null,
          createdAt: TIME,
          updatedAt: TIME,
          labelIds: ['label'],
          checklistItems: [
            {
              id: 'one',
              cardId: 'card',
              text: 'One',
              done: true,
              position: 'a0',
            },
            {
              id: 'two',
              cardId: 'card',
              text: 'Two',
              done: false,
              position: 'a1',
            },
          ],
        },
      ],
    },
    {
      id: 'done',
      boardId: 'board',
      name: 'Done',
      position: 'a1',
      wipLimit: 0,
      createdAt: TIME,
      updatedAt: TIME,
      cards: [],
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('read-only board', () => {
  it('renders columns, cards, labels, checklist progress, empty state, and WIP status', async () => {
    stubResponse(hydrate);
    renderApp();

    expect(
      await screen.findByRole('heading', { name: 'My Board' }),
    ).toBeTruthy();
    expect(screen.getByText('Ship the board')).toBeTruthy();
    expect(screen.getByText('Important')).toBeTruthy();
    expect(screen.getByText('1/2')).toBeTruthy();
    expect(screen.getByText(/No cards yet/)).toBeTruthy();
    expect(screen.getByLabelText('1 / 0, over WIP limit')).toBeTruthy();
    expect(screen.getByLabelText('0 / 0, at WIP limit')).toBeTruthy();
  });

  it('renders a board-shaped skeleton while hydration is pending', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => undefined)),
    );
    renderApp();
    expect(screen.getByLabelText('Loading board')).toBeTruthy();
  });

  it('resets a failed query and retries from the error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchMock = vi
      .fn<() => Promise<Response>>()
      .mockResolvedValueOnce(
        jsonResponse(
          { error: { code: 'INTERNAL_ERROR', message: 'Failed' } },
          500,
        ),
      )
      .mockResolvedValueOnce(jsonResponse(hydrate));
    vi.stubGlobal('fetch', fetchMock);
    renderApp();

    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(
      await screen.findByRole('heading', { name: 'My Board' }),
    ).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('communicates overdue and near-due states with text and color classes', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const { rerender } = render(
      <DueDatePill dueDate="2025-12-31T00:00:00.000Z" now={now} />,
    );
    expect(screen.getByText(/Overdue/).className).toContain('red');
    rerender(<DueDatePill dueDate="2026-01-01T12:00:00.000Z" now={now} />);
    expect(screen.getByText(/Due/).className).toContain('amber');
  });

  it('opens the detail drawer and closes it with Escape', async () => {
    stubResponse(hydrate);
    renderApp();
    const card = await screen.findByLabelText('Card: Ship the board');
    fireEvent.click(card);
    expect(await screen.findByTestId('card-drawer')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Card title').value).toBe(
      'Ship the board',
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('card-drawer')).toBeNull();
  });
});

function renderApp(): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

function stubResponse(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(jsonResponse(body))),
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
