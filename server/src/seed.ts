import { pathToFileURL } from 'node:url';
import process from 'node:process';

import type Database from 'better-sqlite3';
import { nanoid } from 'nanoid';

import { parseConfig } from './config.js';
import { openDatabase } from './db/client.js';
import { migrateDatabase } from './db/migrate.js';
import { createLogger } from './logger.js';

const demoColumns = [
  {
    name: 'To do',
    position: 'a0',
    cards: [
      'Plan the week',
      'Review project notes',
      'Book a dentist appointment',
    ],
  },
  {
    name: 'Doing',
    position: 'a1',
    cards: ['Build the Kanban data layer', 'Take a proper lunch break'],
  },
  {
    name: 'Done',
    position: 'a2',
    cards: [
      'Set up the workspace',
      'Write the scaffold tests',
      'Make the first commit',
    ],
  },
] as const;

export interface SeedResult {
  readonly boardId?: string;
  readonly seeded: boolean;
}

export function seedDatabase(database: Database.Database): SeedResult {
  const seed = database.transaction((): SeedResult => {
    const existingBoard = database
      .prepare('SELECT id FROM boards LIMIT 1')
      .get();
    if (existingBoard) return { seeded: false };

    const timestamp = new Date().toISOString();
    const boardId = nanoid();
    database
      .prepare(
        'INSERT INTO boards (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
      )
      .run(boardId, 'My Board', timestamp, timestamp);

    const insertColumn = database.prepare(
      'INSERT INTO columns (id, board_id, name, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const insertCard = database.prepare(
      'INSERT INTO cards (id, column_id, title, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    );

    for (const column of demoColumns) {
      const columnId = nanoid();
      insertColumn.run(
        columnId,
        boardId,
        column.name,
        column.position,
        timestamp,
        timestamp,
      );
      for (const [index, title] of column.cards.entries()) {
        insertCard.run(
          nanoid(),
          columnId,
          title,
          `a${String(index)}`,
          timestamp,
          timestamp,
        );
      }
    }

    return { boardId, seeded: true };
  });

  return seed();
}

function runCli(): void {
  try {
    process.loadEnvFile();
  } catch (error: unknown) {
    if (!isMissingFileError(error)) throw error;
  }

  const config = parseConfig(process.env);
  const logger = createLogger(config.nodeEnv);
  const database = openDatabase(config.databasePath);

  try {
    migrateDatabase(database);
    const result = seedDatabase(database);
    logger.info(
      result,
      result.seeded
        ? 'demo board created'
        : 'database already contains a board',
    );
  } finally {
    database.close();
  }
}

function isMissingFileError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as Error & { code?: unknown }).code === 'ENOENT'
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCli();
}
