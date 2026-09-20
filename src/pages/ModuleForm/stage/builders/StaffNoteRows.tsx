import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, X } from 'lucide-react';
import type { StaffNoteEntry, NoteDuration, FretPosition } from '../../../../types/lessonStep';
import {
  NOTE_LETTERS,
  ACCIDENTALS,
  parseNoteWithOctave,
  formatNoteWithOctave,
  noteWithOctaveFromStringAndFret,
} from '../../../../core/musicTheory';
import type { Accidental } from '../../../../core/musicTheory';
import { playNote } from '../../../../core/AudioEngine';
import { inputClass, labelClass } from '../../stepEditorStyles';
import { PlayerFretboard } from '../players/PlayerFretboard';
import { positionKey } from '../utils/positionKey';
import { DURATIONS } from '../../stepDefaults';

interface StaffNoteRowsProps {
  notes: StaffNoteEntry[];
  onNotesChange: (notes: StaffNoteEntry[]) => void;
  showTarget?: boolean;
}

export function StaffNoteRows({ notes, onNotesChange, showTarget = false }: StaffNoteRowsProps) {
  const { t } = useTranslation();

  function updateEntry(index: number, patch: Partial<StaffNoteEntry>) {
    const next = [...notes];
    next[index] = { ...next[index], ...patch };
    onNotesChange(next);
  }

  function removeEntry(index: number) {
    onNotesChange(notes.filter((_, i) => i !== index));
  }

  function addEntry(withNote: boolean) {
    const entry: StaffNoteEntry = withNote ? { note: 'C4', duration: 'quarter' } : { duration: 'quarter' };
    onNotesChange([...notes, entry]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>{t('moduleForm.stepEditor.staffNotes')}</label>

      {notes.length === 0 && <p className="text-muted-foreground text-xs ml-1">{t('moduleForm.stepEditor.staffEmpty')}</p>}

      {notes.map((entry, index) => (
        <StaffNoteRow
          key={index}
          entry={entry}
          showTarget={showTarget}
          onChange={(patch) => updateEntry(index, patch)}
          onRemove={() => removeEntry(index)}
        />
      ))}

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

interface StaffNoteRowProps {
  entry: StaffNoteEntry;
  showTarget: boolean;
  onChange: (patch: Partial<StaffNoteEntry>) => void;
  onRemove: () => void;
}

function StaffNoteRow({ entry, showTarget, onChange, onRemove }: StaffNoteRowProps) {
  const { t } = useTranslation();
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const isRest = !entry.note;
  const parsed = parseNoteWithOctave(entry.note ?? 'C4');

  function setNotePart(part: Partial<{ letter: string; accidental: Accidental; octave: number }>) {
    const next = { ...parsed, ...part };
    const noteWithOctave = formatNoteWithOctave(next.letter, next.accidental, next.octave);
    playNote(noteWithOctave);
    onChange({ note: noteWithOctave });
  }

  function toggleRest() {
    onChange({ note: isRest ? 'C4' : undefined, target: undefined });
    setShowTargetPicker(false);
  }

  function setTarget(stringNumber: number, fret: number) {
    playNote(noteWithOctaveFromStringAndFret(stringNumber, fret));
    const position = { string: stringNumber, fret };
    const isSame = entry.target && positionKey(entry.target) === positionKey(position);
    onChange({ target: isSame ? undefined : position });
  }

  return (
    <div className="bg-input-background border border-border/10 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={isRest} onChange={toggleRest} />
          {t('moduleForm.stepEditor.isRest')}
        </label>

        {!isRest && (
          <>
            <select
              value={parsed.letter}
              onChange={(event) => setNotePart({ letter: event.target.value })}
              className={`${inputClass} w-16`}
            >
              {NOTE_LETTERS.map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </select>
            <select
              value={parsed.accidental}
              onChange={(event) => setNotePart({ accidental: event.target.value as Accidental })}
              className={`${inputClass} w-28`}
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
              className={`${inputClass} w-16`}
            />
          </>
        )}

        <select
          value={entry.duration}
          onChange={(event) => onChange({ duration: event.target.value as NoteDuration })}
          className={`${inputClass} w-32`}
        >
          {DURATIONS.map((duration) => (
            <option key={duration} value={duration}>
              {t(`moduleForm.stepEditor.duration${duration.charAt(0).toUpperCase()}${duration.slice(1)}`)}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={entry.dotted ?? false}
            onChange={(event) => onChange({ dotted: event.target.checked })}
          />
          {t('moduleForm.stepEditor.dotted')}
        </label>

        <button type="button" onClick={onRemove} className="ml-auto p-1.5 rounded-lg border border-destructive/40 text-destructive">
          <Trash2 size={14} />
        </button>
      </div>

      {showTarget && !isRest && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <label className={labelClass}>{t('moduleForm.stepEditor.fieldTarget')}</label>
            {entry.target && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/20 text-primary text-xs font-mono">
                {t('moduleForm.stepEditor.positionLabel', { string: entry.target.string, fret: entry.target.fret })}
                <button type="button" onClick={() => onChange({ target: undefined })}>
                  <X size={11} />
                </button>
              </span>
            )}
            <button type="button" onClick={() => setShowTargetPicker((v) => !v)} className="text-xs text-primary font-medium">
              {t('moduleForm.stepEditor.setTarget')}
            </button>
          </div>
          {showTargetPicker && (
            <div className="rounded-lg overflow-hidden">
              <PlayerFretboard frets={24} notes={entry.target ? [entry.target as FretPosition] : []} onCellClick={setTarget} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
