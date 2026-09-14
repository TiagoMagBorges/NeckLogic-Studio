import { useTranslation } from 'react-i18next';
import type { LessonStep, StepKind, FretPosition, StaffNoteEntry } from '../../../types/lessonStep';
import { PlayerFretboard } from './PlayerFretboard';
import { PlayerCircleOfFifths } from './PlayerCircleOfFifths';
import { PlayerHarmonicField } from './PlayerHarmonicField';
import { PlayerStaffDisplay } from './PlayerStaffDisplay';
import { computeChordPreviewNotes } from './chordPreview';

const SEQUENCE_KINDS: StepKind[] = ['SCALE_DEGREES', 'ARPEGGIO', 'TAB_READING'];

interface ExercisePreviewProps {
  step: LessonStep;
  kind: StepKind;
}

export function ExercisePreview({ step, kind }: ExercisePreviewProps) {
  const { t } = useTranslation();
  const question = step.question as string | undefined;

  return (
    <div className="flex flex-col gap-4">
      {question && <p className="text-primary text-center text-lg font-bold">{question}</p>}

      {kind === 'MULTIPLE_CHOICE' && <MultipleChoicePreview step={step} />}
      {(kind === 'CHORD_BUILD' || kind === 'TRIAD_INVERSION') && <ChordPreview step={step} />}
      {kind === 'CIRCLE_OF_FIFTHS' && (
        <div className="flex justify-center">
          <PlayerCircleOfFifths selectedKeys={step.targetKey ? [step.targetKey as string] : []} />
        </div>
      )}
      {kind === 'HARMONIC_FIELD' && (
        <div className="flex justify-center">
          <PlayerHarmonicField
            rootKey={(step.key as string) ?? 'C'}
            mode={(step.mode as 'major' | 'minor') ?? 'major'}
            selectedDegrees={step.targetDegree ? [step.targetDegree as string] : []}
          />
        </div>
      )}
      {kind === 'SHAPE_MATCH' && <ShapeMatchPreview step={step} />}
      {kind === 'FIND_ALL_OCCURRENCES' && (
        <p className="text-center text-muted-foreground text-sm">
          {t('moduleForm.stepEditor.fieldTargetNote')}: <span className="text-primary font-bold">{(step.targetNote as string) ?? '—'}</span>
        </p>
      )}
      {SEQUENCE_KINDS.includes(kind) && <SequencePreview sequence={(step.targetSequence as FretPosition[]) ?? []} />}
      {kind === 'STAFF_READING' && <StaffPreview step={step} />}
    </div>
  );
}

function MultipleChoicePreview({ step }: { step: LessonStep }) {
  const options = (step.options as string[]) ?? [];
  const correctAnswer = step.correctAnswer as string | undefined;

  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option, index) => (
        <div
          key={index}
          className={`py-3 px-4 rounded-xl font-semibold text-[14.5px] border-[1.5px] ${
            option === correctAnswer ? 'border-primary bg-primary/10' : 'border-border/15 bg-secondary'
          }`}
        >
          {option || '—'}
        </div>
      ))}
    </div>
  );
}

function ChordPreview({ step }: { step: LessonStep }) {
  const root = step.root as string | undefined;
  const quality = step.quality as string | undefined;
  const chordShape = step.chordShape as FretPosition[] | undefined;
  const notes = chordShape ?? (root && quality ? computeChordPreviewNotes(root, quality) : []);

  return (
    <div className="rounded-lg overflow-hidden">
      <PlayerFretboard frets={24} notes={notes} />
    </div>
  );
}

function ShapeMatchPreview({ step }: { step: LessonStep }) {
  const { t } = useTranslation();

  if (Array.isArray(step.targetShape)) {
    const shape = step.targetShape as FretPosition[];
    return (
      <div className="rounded-lg overflow-hidden">
        <PlayerFretboard frets={24} notes={shape} />
      </div>
    );
  }

  if (Array.isArray(step.targetNotes)) {
    const notes = step.targetNotes as string[];
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {notes.map((note) => (
          <span key={note} className="px-3 py-1.5 rounded-lg text-sm font-mono border border-primary text-primary bg-primary/10">
            {note}
          </span>
        ))}
      </div>
    );
  }

  return (
    <p className="text-center text-muted-foreground text-sm">
      {t('moduleForm.stepEditor.fieldTargetNote')}: <span className="text-primary font-bold">{(step.targetNote as string) ?? '—'}</span>
    </p>
  );
}

function SequencePreview({ sequence }: { sequence: FretPosition[] }) {
  const notes = sequence.map((p, index) => ({ ...p, label: String(index + 1) }));
  return (
    <div className="rounded-lg overflow-hidden">
      <PlayerFretboard frets={24} notes={notes} />
    </div>
  );
}

function StaffPreview({ step }: { step: LessonStep }) {
  const notes = (step.staffNotes as StaffNoteEntry[]) ?? [];
  if (notes.length === 0) return null;
  return <PlayerStaffDisplay notes={notes} clef={step.clef as 'treble' | 'bass'} beatsPerMeasure={step.beatsPerMeasure as number} />;
}