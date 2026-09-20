import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import type { NoteDuration, TabNoteEntry } from '../../../../types/lessonStep';
import { noteWithOctaveFromStringAndFret } from '../../../../core/musicTheory';
import { playNote } from '../../../../core/AudioEngine';
import { inputClass, labelClass } from '../../stepEditorStyles';
import { DURATIONS } from '../../stepDefaults';

const STRINGS = [1, 2, 3, 4, 5, 6];

interface TabNoteRowsProps {
  notes: TabNoteEntry[];
  onNotesChange: (notes: TabNoteEntry[]) => void;
}

export function TabNoteRows({ notes, onNotesChange }: TabNoteRowsProps) {
  const { t } = useTranslation();

  function updateEntry(index: number, patch: Partial<TabNoteEntry>) {
    const next = [...notes];
    next[index] = { ...next[index], ...patch };
    onNotesChange(next);
  }

  function removeEntry(index: number) {
    onNotesChange(notes.filter((_, i) => i !== index));
  }

  function addEntry(withNote: boolean) {
    const entry: TabNoteEntry = withNote ? { string: 6, fret: 0, duration: 'quarter' } : { duration: 'quarter' };
    onNotesChange([...notes, entry]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>{t('moduleForm.stepEditor.staffNotes')}</label>

      {notes.length === 0 && <p className="text-muted-foreground text-xs ml-1">{t('moduleForm.stepEditor.staffEmpty')}</p>}

      {notes.map((entry, index) => (
        <TabNoteRow key={index} entry={entry} onChange={(patch) => updateEntry(index, patch)} onRemove={() => removeEntry(index)} />
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

interface TabNoteRowProps {
  entry: TabNoteEntry;
  onChange: (patch: Partial<TabNoteEntry>) => void;
  onRemove: () => void;
}

function TabNoteRow({ entry, onChange, onRemove }: TabNoteRowProps) {
  const { t } = useTranslation();
  const isRest = entry.string === undefined || entry.fret === undefined;

  function toggleRest() {
    onChange(isRest ? { string: 6, fret: 0 } : { string: undefined, fret: undefined });
  }

  function setString(stringNumber: number) {
    playNote(noteWithOctaveFromStringAndFret(stringNumber, entry.fret ?? 0));
    onChange({ string: stringNumber });
  }

  function setFret(fret: number) {
    const clamped = Math.max(0, Math.min(24, fret));
    playNote(noteWithOctaveFromStringAndFret(entry.string ?? 6, clamped));
    onChange({ fret: clamped });
  }

  return (
    <div className="bg-input-background border border-border/10 rounded-lg p-3 flex items-center gap-3 flex-wrap">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input type="checkbox" checked={isRest} onChange={toggleRest} />
        {t('moduleForm.stepEditor.isRest')}
      </label>

      {!isRest && (
        <>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">{t('moduleForm.stepEditor.fieldString')}</span>
            <select value={entry.string} onChange={(event) => setString(Number(event.target.value))} className={`${inputClass} w-16`}>
              {STRINGS.map((stringNumber) => (
                <option key={stringNumber} value={stringNumber}>
                  {stringNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">{t('moduleForm.stepEditor.fieldFret')}</span>
            <input
              type="number"
              min={0}
              max={24}
              value={entry.fret}
              onChange={(event) => setFret(Number(event.target.value))}
              className={`${inputClass} w-16`}
            />
          </div>
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
        <input type="checkbox" checked={entry.dotted ?? false} onChange={(event) => onChange({ dotted: event.target.checked })} />
        {t('moduleForm.stepEditor.dotted')}
      </label>

      <button type="button" onClick={onRemove} className="ml-auto p-1.5 rounded-lg border border-destructive/40 text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
