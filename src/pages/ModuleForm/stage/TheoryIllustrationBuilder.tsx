import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import type {
  LessonStep,
  TheoryIllustration,
  StaffNoteEntry,
  NoteDuration,
  ClefType,
} from '../../../types/lessonStep';
import {
  CHROMATIC_SCALE,
  NOTE_LETTERS,
  ACCIDENTALS,
  parseNoteWithOctave,
  formatNoteWithOctave,
  noteFromStringAndFret,
} from '../../../core/musicTheory';
import type { Accidental } from '../../../core/musicTheory';
import { PlayerFretboard } from './PlayerFretboard';
import { PlayerCircleOfFifths } from './PlayerCircleOfFifths';
import { PlayerHarmonicField } from './PlayerHarmonicField';
import { PlayerStaffDisplay } from './PlayerStaffDisplay';
import { positionKey } from './positionKey';

type IllustrationKind = TheoryIllustration['kind'];

const inputClass =
  'bg-input-background border border-border/10 rounded-lg px-2 py-1.5 text-foreground text-xs focus:outline-none focus:border-primary';

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
          className={inputClass}
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
          className={inputClass}
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

const DURATIONS: NoteDuration[] = ['whole', 'half', 'quarter', 'eighth', 'sixteenth'];

function StaffIllustrationEditor({
                                   illustration,
                                   onChange,
                                 }: {
  illustration: Extract<TheoryIllustration, { kind: 'staff' }>;
  onChange: (patch: Partial<LessonStep>) => void;
}) {
  const { t } = useTranslation();
  const notes = illustration.notes;

  function updateEntry(index: number, patch: Partial<StaffNoteEntry>) {
    const next = [...notes];
    next[index] = { ...next[index], ...patch };
    onChange({ illustration: { ...illustration, notes: next } });
  }

  function removeEntry(index: number) {
    onChange({ illustration: { ...illustration, notes: notes.filter((_, i) => i !== index) } });
  }

  function addEntry(withNote: boolean) {
    const entry: StaffNoteEntry = withNote ? { note: 'C4', duration: 'quarter' } : { duration: 'quarter' };
    onChange({ illustration: { ...illustration, notes: [...notes, entry] } });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-[11px]">{t('theoryIllustration.staffHint')}</p>

      <div className="flex gap-2">
        <select
          value={illustration.clef}
          onChange={(event) => onChange({ illustration: { ...illustration, clef: event.target.value as ClefType } })}
          className={inputClass}
        >
          <option value="treble">{t('moduleForm.stepEditor.clefTreble')}</option>
          <option value="bass">{t('moduleForm.stepEditor.clefBass')}</option>
        </select>
        <input
          type="number"
          min="1"
          value={illustration.beatsPerMeasure}
          onChange={(event) => onChange({ illustration: { ...illustration, beatsPerMeasure: Number(event.target.value) } })}
          className={`${inputClass} w-16`}
        />
      </div>

      {notes.length > 0 && <PlayerStaffDisplay notes={notes} clef={illustration.clef} beatsPerMeasure={illustration.beatsPerMeasure} />}

      <div className="flex flex-col gap-1.5">
        {notes.map((entry, index) => (
          <StaffEntryRow key={index} entry={entry} onChange={(patch) => updateEntry(index, patch)} onRemove={() => removeEntry(index)} />
        ))}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => addEntry(true)} className="flex items-center gap-1 text-primary text-xs font-medium">
          <Plus size={14} />
          {t('moduleForm.stepEditor.addNote')}
        </button>
        <button type="button" onClick={() => addEntry(false)} className="flex items-center gap-1 text-primary text-xs font-medium">
          <Plus size={14} />
          {t('moduleForm.stepEditor.addRest')}
        </button>
      </div>
    </div>
  );
}

function StaffEntryRow({
                         entry,
                         onChange,
                         onRemove,
                       }: {
  entry: StaffNoteEntry;
  onChange: (patch: Partial<StaffNoteEntry>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const isRest = !entry.note;
  const parsed = parseNoteWithOctave(entry.note ?? 'C4');

  function setNotePart(part: Partial<{ letter: string; accidental: Accidental; octave: number }>) {
    const next = { ...parsed, ...part };
    onChange({ note: formatNoteWithOctave(next.letter, next.accidental, next.octave) });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap bg-input-background border border-border/10 rounded-lg px-2 py-1.5">
      <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <input type="checkbox" checked={isRest} onChange={() => onChange({ note: isRest ? 'C4' : undefined })} />
        {t('moduleForm.stepEditor.isRest')}
      </label>

      {!isRest && (
        <>
          <select value={parsed.letter} onChange={(event) => setNotePart({ letter: event.target.value })} className={`${inputClass} w-14`}>
            {NOTE_LETTERS.map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
          <select
            value={parsed.accidental}
            onChange={(event) => setNotePart({ accidental: event.target.value as Accidental })}
            className={`${inputClass} w-24`}
          >
            {ACCIDENTALS.map((accidental) => (
              <option key={accidental} value={accidental}>
                {t(`moduleForm.stepEditor.accidental${accidental.charAt(0).toUpperCase()}${accidental.slice(1)}`)}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={parsed.octave}
            onChange={(event) => setNotePart({ octave: Number(event.target.value) })}
            className={`${inputClass} w-14`}
          />
        </>
      )}

      <select
        value={entry.duration}
        onChange={(event) => onChange({ duration: event.target.value as NoteDuration })}
        className={`${inputClass} w-28`}
      >
        {DURATIONS.map((duration) => (
          <option key={duration} value={duration}>
            {t(`moduleForm.stepEditor.duration${duration.charAt(0).toUpperCase()}${duration.slice(1)}`)}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <input type="checkbox" checked={entry.dotted ?? false} onChange={(event) => onChange({ dotted: event.target.checked })} />
        {t('moduleForm.stepEditor.dotted')}
      </label>

      <button type="button" onClick={onRemove} className="ml-auto p-1 rounded-lg border border-destructive/40 text-destructive">
        <X size={12} />
      </button>
    </div>
  );
}