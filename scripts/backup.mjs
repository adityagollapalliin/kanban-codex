import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import Database from 'better-sqlite3';

const sourcePath = process.env.DATABASE_PATH ?? './data/kanban.sqlite';
if (sourcePath === ':memory:') {
  process.stderr.write('DATABASE_PATH must point to a file for backup\n');
  process.exitCode = 1;
} else {
  const source = resolve(sourcePath);
  if (!existsSync(source)) {
    process.stderr.write(`Database does not exist: ${source}\n`);
    process.exitCode = 1;
  } else {
    const directory = resolve('backups');
    mkdirSync(directory, { recursive: true });
    const stamp = new Date()
      .toISOString()
      .replaceAll(/[-:.]/g, '')
      .replace('Z', 'Z');
    const destination = resolve(directory, `kanban-${stamp}.sqlite`);
    const database = new Database(source, {
      readonly: true,
      fileMustExist: true,
    });
    try {
      await database.backup(destination);
      process.stdout.write(`${destination}\n`);
    } finally {
      database.close();
    }
  }
}
