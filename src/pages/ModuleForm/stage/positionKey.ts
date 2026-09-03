import type { FretPosition } from '../../../types/lessonStep';

export function positionKey(position: FretPosition): string {
  return `${position.string}-${position.fret}`;
}