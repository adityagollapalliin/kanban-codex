import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceDirectory = resolve(repositoryRoot, 'server/src/db/migrations');
const targetDirectory = resolve(
  repositoryRoot,
  'server/dist/src/db/migrations',
);

mkdirSync(targetDirectory, { recursive: true });
for (const filename of readdirSync(sourceDirectory)) {
  if (filename.endsWith('.sql')) {
    copyFileSync(
      resolve(sourceDirectory, filename),
      resolve(targetDirectory, filename),
    );
  }
}
