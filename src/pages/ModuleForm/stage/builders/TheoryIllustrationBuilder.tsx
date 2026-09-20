import { useTranslation } from 'react-i18next';
import type { LessonStep, TheoryIllustration, ClefType } from '../../../../types/lessonStep';
import { CHROMATIC_SCALE, noteFromStringAndFret } from '../../../../core/musicTheory';
import { PlayerFretboard } from '../players/PlayerFretboard';
import { PlayerCircleOfFifths } from '../players/PlayerCircleOfFifths';
import { PlayerHarmonicField } from '../players/PlayerHarmonicField';
import { StaffNoteBuilder } from './StaffNoteBuilder';
import { StaffNoteRows } from './StaffNoteRows';
import { positionKey } from '../utils/positionKey';
import { compactInputClass } from '../../stepEditorStyles';

type IllustrationKind = TheoryIllustration['kind'];

function defaultIllustration(kind: IllustrationKind): TheoryIllustration {
  switch (kind) {
    case 'fretboard':
      return { kind, notes: [] };
    case 'circleOfFifths':
      return { kind, highlightedKeys: [] };
    case 'harmonicField':
      return { kind, key: 'C', mode: 'major', highlightedDegrees: [] };
    case 'staff':
      return { kind, clef: 'treble', beatsPerMeasure: 4, notes: [] };
  }
}

interface TheoryIllustrationBuilderProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function TheoryIllustrationBuilder({ step, onChange }: TheoryIllustrationBuilderProps) {
  const { t } = useTranslation();
  const illustration = step.illustration;

  function setKind(kind: IllustrationKind | 'none') {
    onChange({ illustration: kind === 'none' ? undefined : defaultIllustration(kind) });
  }

  const pills: Array<{ value: IllustrationKind | 'none'; label: string }> = [
    { value: 'none', label: t('theoryIllustration.kindNone') },
    { value: 'fretboard', label: t('theoryIllustration.kindFretboard') },
    { value: 'circleOfFifths', label: t('theoryIllustration.kindCircle') },
    { value: 'harmonicField', label: t('theoryIllustration.kindHarmonic') },
    { value: 'staff', label: t('theoryIllustration.kindStaff') },
  ];

  const activeKind: IllustrationKind | 'none' = illustration?.kind ?? 'none';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {pills.map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => setKind(pill.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              activeKind === pill.value
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border/20 text-muted-foreground bg-input-background'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {illustration?.kind === 'fretboard' && <FretboardIllustrationEditor illustration={illustration} onChange={onChange} />}
      {illustration?.kind === 'circleOfFifths' && <CircleIllustrationEditor illustration={illustration} onChange={onChange} />}
      {illustration?.kind === 'harmonicField' && <HarmonicIllustrationEditor illustration={illustration} onChange={onChange} />}
      {illustration?.kind === 'staff' && <StaffIllustrationEditor illustration={illustration} onChange={onChange} />}
    </div>
  );
}

function FretboardIllustrationEditor({
                                       illustration,
                                       onChange,
                                     }: {
  illustration: Extract<TheoryIllustration, { kind: 'fretboard' }>;
  onChange: (patch: Partial<LessonStep>) => void;
}) {
  const { t } = useTranslation();
  const positions = illustration.notes;

  function toggle(stringNumber: number, fret: number) {
    const position = { string: stringNumber, fret };
    const exists = positions.some((p) => positionKey(p) === positionKey(position));
    const next = exists ? positions.filter((p) => positionKey(p) !== positionKey(position)) : [...positions, position];
    onChange({ illustration: { ...illustration, notes: next } });
  }

  const displayNotes = positions.map((p) => ({ ...p, label: noteFromStringAndFret(p.string, p.fret) }));

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-muted-foreground text-[11px]">{t('theoryIllustration.fretboardHint')}</p>
      <div className="rounded-lg overflow-hidden">
        <PlayerFretboard frets={24} notes={displayNotes} onCellClick={toggle} />
      </div>
    </div>
  );
}

function CircleIllustrationEditor({
                                    illustration,
                                    onChange,
                                  }: {
  illustration: Extract<TheoryIllustration, { kind: 'circleOfFifths' }>;
  onChange: (patch: Partial<LessonStep>) => void;
}) {
  const { t } = useTranslation();

  function toggle(note: string) {
    const next = illustration.highlightedKeys.includes(note)
      ? illustration.highlightedKeys.filter((n) => n !== note)
      : [...illustration.highlightedKeys, note];
    onChange({ illustration: { ...illustration, highlightedKeys: next } });
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-muted-foreground text-[11px] self-start">{t('theoryIllustration.circleHint')}</p>
      <PlayerCircleOfFifths selectedKeys={illustration.highlightedKeys} onToggleKey={toggle} />
    </div>
  );
}

function HarmonicIllustrationEditor({
                                      illustration,
                                      onChange,
                                    }: {
  illustration: Extract<TheoryIllustration, { kind: 'harmonicField' }>;
  onChange: (patch: Partial<LessonStep>) => void;
}) {
  const { t } = useTranslation();

  function toggle(degree: string) {
    const next = illustration.highlightedDegrees.includes(degree)
      ? illustration.highlightedDegrees.filter((d) => d !== degree)
      : [...illustration.highlightedDegrees, degree];
    onChange({ illustration: { ...illustration, highlightedDegrees: next } });
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-2 self-start">
        <select
          value={illustration.key}
          onChange={(event) => onChange({ illustration: { ...illustration, key: event.target.value, highlightedDegrees: [] } })}
          className={compactInputClass}
        >
          {CHROMATIC_SCALE.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
        <select
          value={illustration.mode}
          onChange={(event) =>
            onChange({
              illustration: { ...illustration, mode: event.target.value as 'major' | 'minor', highlightedDegrees: [] },
            })
          }
          className={compactInputClass}
        >
          <option value="major">{t('moduleForm.stepEditor.modeMajor')}</option>
          <option value="minor">{t('moduleForm.stepEditor.modeMinor')}</option>
        </select>
      </div>
      <p className="text-muted-foreground text-[11px] self-start">{t('theoryIllustration.harmonicHint')}</p>
      <PlayerHarmonicField rootKey={illustration.key} mode={illustration.mode} selectedDegrees={illustration.highlightedDegrees} onToggleDegree={toggle} />
    </div>
  );
}

function StaffIllustrationEditor({
                                   illustration,
                                   onChange,
                                 }: {
  illustration: Extract<TheoryIllustration, { kind: 'staff' }>;
  onChange: (patch: Partial<LessonStep>) => void;
}) {
  const { t } = useTranslation();
  const notes = illustration.notes;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-[11px]">{t('theoryIllustration.staffHint')}</p>

      <div className="flex gap-2">
        <select
          value={illustration.clef}
          onChange={(event) => onChange({ illustration: { ...illustration, clef: event.target.value as ClefType } })}
          className={compactInputClass}
        >
          <option value="treble">{t('moduleForm.stepEditor.clefTreble')}</option>
          <option value="bass">{t('moduleForm.stepEditor.clefBass')}</option>
        </select>
        <input
          type="number"
          min="1"
          value={illustration.beatsPerMeasure}
          onChange={(event) => onChange({ illustration: { ...illustration, beatsPerMeasure: Number(event.target.value) } })}
          className={`${compactInputClass} w-16`}
        />
      </div>

      <StaffNoteBuilder
        notes={notes}
        clef={illustration.clef}
        beatsPerMeasure={illustration.beatsPerMeasure}
        onNotesChange={(next) => onChange({ illustration: { ...illustration, notes: next } })}
      />

      <StaffNoteRows notes={notes} onNotesChange={(next) => onChange({ illustration: { ...illustration, notes: next } })} />
    </div>
  );
}