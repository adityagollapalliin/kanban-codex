import {
  generateEvenPositions,
  generatePositionBetween,
  isPositionStrictlyBetween,
  MAX_POSITION_LENGTH,
} from '@kanban/shared';
import type Database from 'better-sqlite3';

export type OrderingErrorCode =
  | 'CARD_NOT_FOUND'
  | 'COLUMN_NOT_FOUND'
  | 'CROSS_BOARD_MOVE'
  | 'NEIGHBOR_NOT_FOUND'
  | 'INVALID_NEIGHBORS';

export class OrderingError extends Error {
  public constructor(
    public readonly code: OrderingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'OrderingError';
  }
}

export interface MoveCardInput {
  readonly cardId: string;
  readonly nextCardId: string | null;
  readonly prevCardId: string | null;
  readonly toColumnId: string;
  readonly updatedAt?: string;
}

export interface MoveCardResult {
  readonly changed: boolean;
  readonly columnId: string;
  readonly position: string;
  readonly rebalanced: boolean;
}

export interface RebalanceResult {
  readonly count: number;
  readonly positions: readonly string[];
}

interface CardRow {
  readonly columnId: string;
  readonly id: string;
  readonly position: string;
}

interface CardWithBoardRow extends CardRow {
  readonly boardId: string;
}

interface ColumnRow {
  readonly boardId: string;
}

export function moveCard(
  database: Database.Database,
  input: MoveCardInput,
): MoveCardResult {
  const move = database.transaction((): MoveCardResult =>
    moveCardWithinTransaction(database, input),
  );
  return move();
}

export function rebalanceColumn(
  database: Database.Database,
  columnId: string,
  updatedAt = new Date().toISOString(),
): RebalanceResult {
  const rebalance = database.transaction(() => {
    requireColumn(database, columnId);
    return rebalanceWithinTransaction(database, columnId, updatedAt);
  });
  return rebalance();
}

function moveCardWithinTransaction(
  database: Database.Database,
  input: MoveCardInput,
): MoveCardResult {
  if (input.prevCardId !== null && input.prevCardId === input.nextCardId) {
    throw new OrderingError(
      'INVALID_NEIGHBORS',
      'Previous and next cards must be different',
    );
  }

  const card = database
    .prepare<[string], CardWithBoardRow>(
      `SELECT cards.id, cards.column_id AS columnId, cards.position, columns.board_id AS boardId
       FROM cards
       JOIN columns ON columns.id = cards.column_id
       WHERE cards.id = ? AND cards.archived_at IS NULL`,
    )
    .get(input.cardId);
  if (!card)
    throw new OrderingError('CARD_NOT_FOUND', 'Active card was not found');

  const targetColumn = requireColumn(database, input.toColumnId);
  if (card.boardId !== targetColumn.boardId) {
    throw new OrderingError(
      'CROSS_BOARD_MOVE',
      'Cards cannot move between boards',
    );
  }

  const targetCards = listActiveCards(database, input.toColumnId, input.cardId);
  const previous = requireNeighbor(targetCards, input.prevCardId);
  const next = requireNeighbor(targetCards, input.nextCardId);

  if (targetCards.length > 0 && previous === null && next === null) {
    throw new OrderingError(
      'INVALID_NEIGHBORS',
      'A non-empty target column requires at least one neighbor',
    );
  }
  if (previous && next && previous.position >= next.position) {
    throw new OrderingError(
      'INVALID_NEIGHBORS',
      'Previous card must sort before next card',
    );
  }

  if (
    card.columnId === input.toColumnId &&
    isCurrentGap(database, card, input.prevCardId, input.nextCardId)
  ) {
    return {
      changed: false,
      columnId: card.columnId,
      position: card.position,
      rebalanced: false,
    };
  }

  const insertionBounds = resolveCurrentInsertionBounds(
    targetCards,
    previous,
    next,
  );
  const position = generatePositionBetween(
    insertionBounds.previous?.position ?? null,
    insertionBounds.next?.position ?? null,
  );
  if (
    !isPositionStrictlyBetween(
      position,
      previous?.position ?? null,
      next?.position ?? null,
    )
  ) {
    throw new OrderingError(
      'INVALID_NEIGHBORS',
      'Generated position is outside the target gap',
    );
  }

  const updatedAt = input.updatedAt ?? new Date().toISOString();
  database
    .prepare(
      'UPDATE cards SET column_id = ?, position = ?, updated_at = ? WHERE id = ?',
    )
    .run(input.toColumnId, position, updatedAt, input.cardId);

  const longestPosition = database
    .prepare<[string], number>(
      'SELECT max(length(position)) FROM cards WHERE column_id = ? AND archived_at IS NULL',
    )
    .pluck()
    .get(input.toColumnId);
  const rebalanced = (longestPosition ?? 0) > MAX_POSITION_LENGTH;
  if (rebalanced) {
    rebalanceWithinTransaction(database, input.toColumnId, updatedAt);
  }

  const finalPosition = database
    .prepare<[string], string>('SELECT position FROM cards WHERE id = ?')
    .pluck()
    .get(input.cardId);
  if (finalPosition === undefined) {
    throw new OrderingError(
      'CARD_NOT_FOUND',
      'Moved card disappeared during the transaction',
    );
  }

  return {
    changed: true,
    columnId: input.toColumnId,
    position: finalPosition,
    rebalanced,
  };
}

function resolveCurrentInsertionBounds(
  cards: readonly CardRow[],
  claimedPrevious: CardRow | null,
  claimedNext: CardRow | null,
): { readonly next: CardRow | null; readonly previous: CardRow | null } {
  if (cards.length === 0) return { previous: null, next: null };

  if (claimedNext === null) {
    return { previous: cards.at(-1) ?? claimedPrevious, next: null };
  }

  if (claimedPrevious === null) {
    return { previous: null, next: cards[0] ?? claimedNext };
  }

  const nextIndex = cards.findIndex(({ id }) => id === claimedNext.id);
  return {
    previous: cards[nextIndex - 1] ?? claimedPrevious,
    next: claimedNext,
  };
}

function requireColumn(
  database: Database.Database,
  columnId: string,
): ColumnRow {
  const column = database
    .prepare<[string], ColumnRow>(
      'SELECT board_id AS boardId FROM columns WHERE id = ?',
    )
    .get(columnId);
  if (!column)
    throw new OrderingError('COLUMN_NOT_FOUND', 'Target column was not found');
  return column;
}

function requireNeighbor(
  cards: readonly CardRow[],
  cardId: string | null,
): CardRow | null {
  if (cardId === null) return null;
  const card = cards.find(({ id }) => id === cardId);
  if (!card) {
    throw new OrderingError(
      'NEIGHBOR_NOT_FOUND',
      'A claimed neighbor is no longer in the target column',
    );
  }
  return card;
}

function listActiveCards(
  database: Database.Database,
  columnId: string,
  excludedCardId?: string,
): CardRow[] {
  return database
    .prepare<[string, string], CardRow>(
      `SELECT id, column_id AS columnId, position
       FROM cards
       WHERE column_id = ? AND archived_at IS NULL AND id != ?
       ORDER BY position ASC`,
    )
    .all(columnId, excludedCardId ?? '');
}

function isCurrentGap(
  database: Database.Database,
  card: CardRow,
  previousCardId: string | null,
  nextCardId: string | null,
): boolean {
  const cards = database
    .prepare<[string], CardRow>(
      `SELECT id, column_id AS columnId, position
       FROM cards
       WHERE column_id = ? AND archived_at IS NULL
       ORDER BY position ASC`,
    )
    .all(card.columnId);
  const index = cards.findIndex(({ id }) => id === card.id);
  return (
    index >= 0 &&
    (cards[index - 1]?.id ?? null) === previousCardId &&
    (cards[index + 1]?.id ?? null) === nextCardId
  );
}

function rebalanceWithinTransaction(
  database: Database.Database,
  columnId: string,
  updatedAt: string,
): RebalanceResult {
  const cards = listActiveCards(database, columnId);
  const positions = generateEvenPositions(cards.length);
  const update = database.prepare(
    'UPDATE cards SET position = ?, updated_at = ? WHERE id = ? AND column_id = ?',
  );

  for (const [index, card] of cards.entries()) {
    const position = positions[index];
    if (position === undefined)
      throw new Error('Rebalance position count mismatch');
    update.run(position, updatedAt, card.id, columnId);
  }

  return { count: cards.length, positions };
}
