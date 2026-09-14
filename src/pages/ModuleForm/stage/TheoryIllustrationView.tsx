import type { TheoryIllustration } from '../../../types/lessonStep';
import { noteFromStringAndFret } from '../../../core/musicTheory';
import { PlayerFretboard } from './PlayerFretboard';
import { PlayerCircleOfFifths } from './PlayerCircleOfFifths';
import { PlayerHarmonicField } from './PlayerHarmonicField';
import { PlayerStaffDisplay } from './PlayerStaffDisplay';

interface TheoryIllustrationViewProps {
  illustration: TheoryIllustration;
}

export function TheoryIllustrationView({ illustration }: TheoryIllustrationViewProps) {
  if (illustration.kind === 'fretboard') {
    const notes = illustration.notes.map((p) => ({ ...p, label: noteFromStringAndFret(p.string, p.fret) }));
    return (
      <div className="rounded-lg overflow-hidden">
        <PlayerFretboard frets={24} notes={notes} />
      </div>
    );
  }

  if (illustration.kind === 'circleOfFifths') {
    return (
      <div className="flex justify-center">
        <PlayerCircleOfFifths selectedKeys={illustration.highlightedKeys} />
      </div>
    );
  }

  if (illustration.kind === 'harmonicField') {
    return (
      <div className="flex justify-center">
        <PlayerHarmonicField rootKey={illustration.key} mode={illustration.mode} selectedDegrees={illustration.highlightedDegrees} />
      </div>
    );
  }

  return <PlayerStaffDisplay notes={illustration.notes} clef={illustration.clef} beatsPerMeasure={illustration.beatsPerMeasure} />;
}