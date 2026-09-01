import type {
  BoardHydrate,
  Card,
  ChecklistItem,
  Column,
  Label,
} from '@kanban/shared';
import type Database from 'better-sqlite3';

import { ApiError } from '../middleware/error-handler.js';

interface BoardRow {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
type ColumnRow = Column;
type CardRow = Omit<Card, 'labelIds' | 'checklistItems'>;
type LabelRow = Label;
interface ChecklistRow {
  id: string;
  cardId: string;
  text: string;
  done: number;
  position: string;
}
interface CardLabelRow {
  cardId: string;
  labelId: string;
}

export function getBoard(database: Database.Database): BoardHydrate {
  return database.transaction(() => {
    const board = database
      .prepare<[], BoardRow>(
        'SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM boards LIMIT 1',
      )
      .get();
    if (!board) throw new ApiError('BOARD_NOT_FOUND', 404, 'Board not found');
    const columns = database
      .prepare<[string], ColumnRow>(
        `SELECT id, board_id AS boardId, name, position, wip_limit AS wipLimit,
              created_at AS createdAt, updated_at AS updatedAt
       FROM columns WHERE board_id = ? ORDER BY position`,
      )
      .all(board.id);
    const cards = database
      .prepare<[string], CardRow>(
        `SELECT cards.id, cards.column_id AS columnId, cards.title, cards.description,
              cards.position, cards.due_date AS dueDate, cards.archived_at AS archivedAt,
              cards.created_at AS createdAt, cards.updated_at AS updatedAt
       FROM cards JOIN columns ON columns.id = cards.column_id
       WHERE columns.board_id = ? AND cards.archived_at IS NULL
       ORDER BY cards.position`,
      )
      .all(board.id);
    const labels = database
      .prepare<[string], LabelRow>(
        'SELECT id, board_id AS boardId, name, color FROM labels WHERE board_id = ? ORDER BY name, id',
      )
      .all(board.id);
    const cardLabels = database
      .prepare<[string], CardLabelRow>(
        `SELECT card_labels.card_id AS cardId, card_labels.label_id AS labelId
       FROM card_labels JOIN cards ON cards.id = card_labels.card_id
       JOIN columns ON columns.id = cards.column_id
       WHERE columns.board_id = ? AND cards.archived_at IS NULL ORDER BY card_labels.label_id`,
      )
      .all(board.id);
    const checklist = database
      .prepare<[string], ChecklistRow>(
        `SELECT checklist_items.id, checklist_items.card_id AS cardId, checklist_items.text,
              checklist_items.done, checklist_items.position
       FROM checklist_items JOIN cards ON cards.id = checklist_items.card_id
       JOIN columns ON columns.id = cards.column_id
       WHERE columns.board_id = ? AND cards.archived_at IS NULL
       ORDER BY checklist_items.position`,
      )
      .all(board.id);
    const hydrateCard = (card: CardRow): Card => ({
      ...card,
      labelIds: cardLabels
        .filter((item) => item.cardId === card.id)
        .map((item) => item.labelId),
      checklistItems: checklist
        .filter((item) => item.cardId === card.id)
        .map(mapChecklist),
    });
    return {
      board,
      columns: columns.map((column) => ({
        ...column,
        cards: cards
          .filter((card) => card.columnId === column.id)
          .map(hydrateCard),
      })),
      labels,
    };
  })();
}

function mapChecklist(row: ChecklistRow): ChecklistItem {
  return { ...row, done: row.done === 1 };
}
