import process from 'node:process';
import argon2 from 'argon2';

const password = process.argv[2];
if (!password) {
  process.stderr.write('Usage: npm run set-password -- <password>\n');
  process.exitCode = 1;
} else {
  process.stdout.write(`${await argon2.hash(password)}\n`);
}
