import { getChordNotes, noteFromStringAndFret } from '../../../core/musicTheory';
import type { FretboardNote } from './PlayerFretboard';

const PREVIEW_FRETS = 5;

export function computeChordPreviewNotes(root: string, quality: string): FretboardNote[] {
  const chordNotes = getChordNotes(root, quality).map((n) => n.toUpperCase());
  if (chordNotes.length === 0) return [];

  const notes: FretboardNote[] = [];

  for (let string = 1; string <= 6; string++) {
    for (let fret = 0; fret <= PREVIEW_FRETS; fret++) {
      const note = noteFromStringAndFret(string, fret).toUpperCase();
      if (chordNotes.includes(note)) {
        notes.push({ string, fret, label: note });
        break;
      }
    }
  }

  return notes;
}