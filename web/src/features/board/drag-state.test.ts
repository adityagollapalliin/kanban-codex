import { describe, expect, it } from 'vitest';
import type { BoardHydrate, Card, HydratedColumn } from '@kanban/shared';

import {
  cardMoveRequest,
  columnMoveRequest,
  moveCardPreview,
  moveColumnPreview,
  sameMove,
} from './drag-state.js';

const TIME = '2026-01-01T00:00:00.000Z';
const card = (id: string, columnId: string, position: string): Card => ({
  id,
  columnId,
  position,
  title: id,
  description: '',
  dueDate: null,
  archivedAt: null,
  createdAt: TIME,
  updatedAt: TIME,
  labelIds: [],
  checklistItems: [],
});
const column = (
  id: string,
  position: string,
  cards: Card[],
): HydratedColumn => ({
  id,
  boardId: 'board',
  name: id,
  position,
  wipLimit: null,
  createdAt: TIME,
  updatedAt: TIME,
  cards,
});
const board: BoardHydrate = {
  board: { id: 'board', name: 'Board', createdAt: TIME, updatedAt: TIME },
  labels: [],
  columns: [
    column('a', 'a0', [card('one', 'a', 'a0'), card('two', 'a', 'a1')]),
    column('b', 'a1', []),
    column('c', 'a2', [card('three', 'c', 'a0')]),
  ],
};

describe('drag state', () => {
  it('moves a card to an empty column and derives authoritative neighbors', () => {
    const moved = moveCardPreview(board, 'one', { type: 'column', id: 'b' });
    expect(moved.columns[0]?.cards.map(({ id }) => id)).toEqual(['two']);
    expect(moved.columns[1]?.cards.map(({ id }) => id)).toEqual(['one']);
    expect(cardMoveRequest(moved, 'one')).toEqual({
      toColumnId: 'b',
      prevCardId: null,
      nextCardId: null,
    });
  });

  it('moves a card before another card across columns', () => {
    const moved = moveCardPreview(board, 'two', {
      type: 'card',
      id: 'three',
    });
    expect(moved.columns[2]?.cards.map(({ id }) => id)).toEqual([
      'two',
      'three',
    ]);
    expect(cardMoveRequest(moved, 'two')).toEqual({
      toColumnId: 'c',
      prevCardId: null,
      nextCardId: 'three',
    });
  });

  it('moves a card down within its current column', () => {
    const moved = moveCardPreview(board, 'one', { type: 'card', id: 'two' });
    expect(moved.columns[0]?.cards.map(({ id }) => id)).toEqual(['two', 'one']);
    expect(cardMoveRequest(moved, 'one')).toEqual({
      toColumnId: 'a',
      prevCardId: 'two',
      nextCardId: null,
    });
  });

  it('preserves a same-target card move as a no-op', () => {
    const before = cardMoveRequest(board, 'two');
    const moved = moveCardPreview(board, 'two', { type: 'column', id: 'a' });
    expect(sameMove(before, cardMoveRequest(moved, 'two'))).toBe(true);
  });

  it('reorders columns and derives their neighbors', () => {
    const moved = moveColumnPreview(board, 'a', 'c');
    expect(moved.columns.map(({ id }) => id)).toEqual(['b', 'c', 'a']);
    expect(columnMoveRequest(moved, 'a')).toEqual({
      prevColumnId: 'c',
      nextColumnId: null,
    });
  });
});
