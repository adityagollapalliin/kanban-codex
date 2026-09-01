import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import process from 'node:process';

import type Database from 'better-sqlite3';

import { parseConfig } from '../config.js';
import { createLogger } from '../logger.js';
import { openDatabase } from './client.js';

const MIGRATION_NAME = /^(\d{3})_[a-z0-9-]+\.sql$/;
const defaultMigrationsDirectory = fileURLToPath(
  new URL('./migrations', import.meta.url),
);

interface MigrationFile {
  readonly checksum: string;
  readonly filename: string;
  readonly number: number;
  readonly sql: string;
}

interface AppliedMigration {
  readonly checksum: string;
  readonly filename: string;
  readonly version: number;
}

export interface MigrationResult {
  readonly applied: readonly string[];
}

export function migrateDatabase(
  database: Database.Database,
  migrationsDirectory = defaultMigrationsDirectory,
): MigrationResult {
  const files = readMigrations(migrationsDirectory);

  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = database
    .prepare<[], AppliedMigration>(
      'SELECT version, filename, checksum FROM _migrations ORDER BY version ASC',
    )
    .all();
  validateAppliedMigrations(files, applied);

  const appliedNow: string[] = [];
  const recordMigration = database.prepare(
    'INSERT INTO _migrations (version, filename, checksum, applied_at) VALUES (?, ?, ?, ?)',
  );

  for (const file of files.slice(applied.length)) {
    const applyMigration = database.transaction(() => {
      database.exec(file.sql);
      recordMigration.run(
        file.number,
        file.filename,
        file.checksum,
        new Date().toISOString(),
      );
    });
    applyMigration();
    appliedNow.push(file.filename);
  }

  return { applied: appliedNow };
}

function readMigrations(directory: string): MigrationFile[] {
  const filenames = readdirSync(directory)
    .filter((filename) => filename.endsWith('.sql'))
    .sort();
  const migrations = filenames.map((filename) => {
    const match = MIGRATION_NAME.exec(filename);
    if (!match) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }

    const sql = readFileSync(
      new URL(filename, pathToFileURL(`${directory}/`)),
      'utf8',
    );
    return {
      checksum: createHash('sha256').update(sql).digest('hex'),
      filename,
      number: Number(match[1]),
      sql,
    };
  });

  for (const [index, migration] of migrations.entries()) {
    const expected = index + 1;
    if (migration.number !== expected) {
      throw new Error(
        `Migration sequence must be contiguous: expected ${String(expected).padStart(3, '0')}, found ${migration.filename}`,
      );
    }
  }

  return migrations;
}

function validateAppliedMigrations(
  files: readonly MigrationFile[],
  applied: readonly AppliedMigration[],
): void {
  for (const [index, migration] of applied.entries()) {
    if (migration.version !== index + 1) {
      throw new Error('Applied migrations are not a contiguous prefix');
    }
    const file = files[migration.version - 1];
    if (!file) {
      throw new Error(
        `Applied migration is missing from disk: ${migration.filename}`,
      );
    }
    if (
      file.filename !== migration.filename ||
      file.checksum !== migration.checksum
    ) {
      throw new Error(`Applied migration has changed: ${migration.filename}`);
    }
  }
}

function runCli(): void {
  loadEnvironmentFile();
  const config = parseConfig(process.env);
  const logger = createLogger(config.nodeEnv);
  const database = openDatabase(config.databasePath);

  try {
    const result = migrateDatabase(database);
    logger.info({ applied: result.applied }, 'database migrations completed');
  } finally {
    database.close();
  }
}

function loadEnvironmentFile(): void {
  try {
    process.loadEnvFile();
  } catch (error: unknown) {
    if (!isMissingFileError(error)) throw error;
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
