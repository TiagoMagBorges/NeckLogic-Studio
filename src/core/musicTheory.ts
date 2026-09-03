export const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

export function noteAtFret(openNote: string, fret: number): string {
  const openIndex = CHROMATIC_SCALE.indexOf(openNote.toUpperCase() as (typeof CHROMATIC_SCALE)[number]);
  if (openIndex === -1) return '';
  return CHROMATIC_SCALE[(openIndex + fret) % 12];
}

export function noteFromStringAndFret(stringNumber: number, fret: number, tuning: string[] = STANDARD_TUNING): string {
  const openNote = tuning[tuning.length - stringNumber];
  return openNote ? noteAtFret(openNote, fret) : '';
}

export const CHORD_QUALITY_KEYS = ['major', 'minor', 'maj7', 'min7', 'dom7', 'dim', 'aug', 'sus2', 'sus4'] as const;

const CHORD_QUALITY_INTERVALS: Record<(typeof CHORD_QUALITY_KEYS)[number], number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

export function getChordNotes(root: string, quality: string): string[] {
  const rootIndex = CHROMATIC_SCALE.indexOf(root.toUpperCase() as (typeof CHROMATIC_SCALE)[number]);
  const intervals = CHORD_QUALITY_INTERVALS[quality as (typeof CHORD_QUALITY_KEYS)[number]];
  if (rootIndex === -1 || !intervals) return [];

  return intervals.map((interval) => CHROMATIC_SCALE[(rootIndex + interval) % 12]);
}

export const HARMONIC_FIELD_DEGREES = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
};

export const CIRCLE_OF_FIFTHS: string[] = Array.from(
  { length: 12 },
  (_, i) => CHROMATIC_SCALE[(i * 7) % 12],
);

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

const MAJOR_FIELD_QUALITIES = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim'];
const MINOR_FIELD_QUALITIES = ['minor', 'dim', 'major', 'minor', 'minor', 'major', 'major'];

export interface HarmonicDegree {
  degree: string;
  root: string;
  quality: string;
}

export function getHarmonicField(root: string, mode: 'major' | 'minor'): HarmonicDegree[] {
  const rootIndex = CHROMATIC_SCALE.indexOf(root.toUpperCase() as (typeof CHROMATIC_SCALE)[number]);
  if (rootIndex === -1) return [];

  const intervals = mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  const numerals = HARMONIC_FIELD_DEGREES[mode];
  const qualities = mode === 'major' ? MAJOR_FIELD_QUALITIES : MINOR_FIELD_QUALITIES;

  return intervals.map((interval, i) => ({
    degree: numerals[i],
    root: CHROMATIC_SCALE[(rootIndex + interval) % 12],
    quality: qualities[i],
  }));
}

export const NOTE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

export const ACCIDENTALS = ['natural', 'sharp', 'flat'] as const;
export type Accidental = (typeof ACCIDENTALS)[number];

const ACCIDENTAL_SYMBOL: Record<Accidental, string> = { natural: '', sharp: '#', flat: 'b' };

export interface ParsedNote {
  letter: (typeof NOTE_LETTERS)[number];
  accidental: Accidental;
  octave: number;
}

export function parseNoteWithOctave(noteWithOctave: string): ParsedNote {
  const match = /^([A-Ga-g])(#|b)?(-?\d+)$/.exec(noteWithOctave.trim());
  if (!match) return { letter: 'C', accidental: 'natural', octave: 4 };

  const [, letter, accidentalSymbol, octaveStr] = match;
  const accidental: Accidental = accidentalSymbol === '#' ? 'sharp' : accidentalSymbol === 'b' ? 'flat' : 'natural';

  return { letter: letter.toUpperCase() as ParsedNote['letter'], accidental, octave: parseInt(octaveStr, 10) };
}

export function formatNoteWithOctave(letter: string, accidental: Accidental, octave: number): string {
  return `${letter}${ACCIDENTAL_SYMBOL[accidental]}${octave}`;
}

const NATURAL_NOTE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const CLEF_BOTTOM_LINE_NOTE: Record<'treble' | 'bass', { letter: string; octave: number }> = {
  treble: { letter: 'E', octave: 4 },
  bass: { letter: 'G', octave: 2 },
};

export function getStaffStep(noteWithOctave: string, clef: 'treble' | 'bass' = 'treble'): number {
  const { letter, octave } = parseNoteWithOctave(noteWithOctave);
  const reference = CLEF_BOTTOM_LINE_NOTE[clef];
  const letterIndex = NATURAL_NOTE_ORDER.indexOf(letter);
  const referenceIndex = NATURAL_NOTE_ORDER.indexOf(reference.letter);

  return (octave - reference.octave) * 7 + (letterIndex - referenceIndex);
}

const DURATION_BEATS: Record<string, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

export function getDurationBeats(duration: string, dotted = false): number {
  const base = DURATION_BEATS[duration] ?? 1;
  return dotted ? base * 1.5 : base;
}