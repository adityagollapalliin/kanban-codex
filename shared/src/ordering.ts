import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';

export const MAX_POSITION_LENGTH = 40;

export function generatePositionBetween(
  previous: string | null,
  next: string | null,
): string {
  if (previous !== null && next !== null && previous >= next) {
    throw new Error('Previous position must sort before next position');
  }
  return generateKeyBetween(previous, next);
}

export function generateEvenPositions(count: number): readonly string[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('Position count must be a non-negative integer');
  }
  return generateNKeysBetween(null, null, count);
}

export function isPositionStrictlyBetween(
  position: string,
  previous: string | null,
  next: string | null,
): boolean {
  return (
    (previous === null || previous < position) &&
    (next === null || position < next)
  );
}
