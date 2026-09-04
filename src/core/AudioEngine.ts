import { getAbsoluteSemitone, getDurationBeats } from './musicTheory';
import type { StaffNoteEntry } from '../types/lessonStep';

const SAMPLE_KEY_TO_FILE: Record<string, string> = {
  E2: 'E2', F2: 'F2', 'F#2': 'Fs2', G2: 'G2', A2: 'A2', 'A#2': 'As2', B2: 'B2',
  C3: 'C3', 'C#3': 'Cs3', D3: 'D3', 'D#3': 'Ds3', E3: 'E3', F3: 'F3', 'F#3': 'Fs3', G3: 'G3', A3: 'A3', 'A#3': 'As3', B3: 'B3',
  C4: 'C4', 'C#4': 'Cs4', D4: 'D4', 'D#4': 'Ds4', E4: 'E4', F4: 'F4', 'F#4': 'Fs4', G4: 'G4', A4: 'A4', 'A#4': 'As4', B4: 'B4',
  C5: 'C5', 'C#5': 'Cs5', D5: 'D5'
};

const AVAILABLE_NOTES = Object.keys(SAMPLE_KEY_TO_FILE);

function findClosestSample(noteWithOctave: string): string {
  if (SAMPLE_KEY_TO_FILE[noteWithOctave]) return noteWithOctave;

  const target = getAbsoluteSemitone(noteWithOctave);
  let closest = AVAILABLE_NOTES[0];
  let closestDistance = Infinity;

  for (const candidate of AVAILABLE_NOTES) {
    const distance = Math.abs(getAbsoluteSemitone(candidate) - target);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = candidate;
    }
  }

  return closest;
}

export function playNote(noteWithOctave: string) {
  const sampleKey = findClosestSample(noteWithOctave);
  const fileName = SAMPLE_KEY_TO_FILE[sampleKey];
  const audio = new Audio(`/audio/guitar-acoustic/${fileName}.mp3`);
  audio.play().catch(() => {});
}

export function playSequence(sequence: StaffNoteEntry[], tempo: number = 100) {
  const msPerBeat = 60000 / tempo;
  let elapsed = 0;

  sequence.forEach((entry) => {
    const beats = getDurationBeats(entry.duration, entry.dotted);

    if (entry.note) {
      const noteAtTime = entry.note;
      setTimeout(() => playNote(noteAtTime), elapsed);
    }

    elapsed += beats * msPerBeat;
  });
}