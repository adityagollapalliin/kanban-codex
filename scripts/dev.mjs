import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const initialBuilds = [
  ['run', 'build', '-w', '@kanban/shared'],
  ['run', 'build', '-w', '@kanban/server'],
];

for (const args of initialBuilds) {
  const result = spawnSync(npmCommand, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const children = [
  spawn(npmCommand, ['run', 'build', '-w', '@kanban/shared', '--', '--watch'], {
    stdio: 'inherit',
  }),
  spawn(npmCommand, ['run', 'build', '-w', '@kanban/server', '--', '--watch'], {
    stdio: 'inherit',
  }),
  spawn(process.execPath, ['--watch', 'server/dist/src/index.js'], {
    stdio: 'inherit',
  }),
  spawn(npmCommand, ['run', 'dev', '-w', '@kanban/web'], { stdio: 'inherit' }),
];

let stopping = false;
function stop(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill(signal);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => stop(signal));
}

for (const child of children) {
  child.once('exit', (code) => {
    if (stopping) return;
    stop();
    process.exitCode = code ?? 1;
  });
}
