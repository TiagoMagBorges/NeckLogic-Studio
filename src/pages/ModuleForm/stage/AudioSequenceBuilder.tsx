import { useTranslation } from 'react-i18next';
import { Play, Plus, X } from 'lucide-react';
import type { LessonStep, TheoryAudioSequence, StaffNoteEntry, NoteDuration } from '../../../types/lessonStep';
import { NOTE_LETTERS, ACCIDENTALS, parseNoteWithOctave, formatNoteWithOctave } from '../../../core/musicTheory';
import type { Accidental } from '../../../core/musicTheory';
import { playNote, playSequence } from '../../../core/AudioEngine';

const inputClass =
  'bg-input-background border border-border/10 rounded-lg px-2 py-1.5 text-foreground text-xs focus:outline-none focus:border-primary';

const DURATIONS: NoteDuration[] = ['whole', 'half', 'quarter', 'eighth', 'sixteenth'];

interface AudioSequenceBuilderProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function AudioSequenceBuilder({ step, onChange }: AudioSequenceBuilderProps) {
  const { t } = useTranslation();
  const audio = step.audio as TheoryAudioSequence | undefined;
  const hasAudio = !!audio;

  function toggleAudio(enabled: boolean) {
    onChange({ audio: enabled ? { sequence: [], tempo: 100 } : undefined });
  }

  function updateSequence(next: StaffNoteEntry[]) {
    onChange({ audio: { sequence: next, tempo: audio?.tempo ?? 100 } });
  }

  function updateEntry(index: number, patch: Partial<StaffNoteEntry>) {
    const sequence = audio?.sequence ?? [];
    const next = [...sequence];
    next[index] = { ...next[index], ...patch };
    updateSequence(next);
  }

  function removeEntry(index: number) {
    updateSequence((audio?.sequence ?? []).filter((_, i) => i !== index));
  }

  function addEntry(withNote: boolean) {
    const entry: StaffNoteEntry = withNote ? { note: 'C4', duration: 'quarter' } : { duration: 'quarter' };
    updateSequence([...(audio?.sequence ?? []), entry]);
  }

  function setTempo(tempo: number) {
    onChange({ audio: { sequence: audio?.sequence ?? [], tempo } });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={hasAudio} onChange={(event) => toggleAudio(event.target.checked)} />
        {t('theoryAudio.enable')}
      </label>

      {hasAudio && (
        <div className="flex flex-col gap-2 pl-1">
          <p className="text-muted-foreground text-[11px]">{t('theoryAudio.hint')}</p>

          <div className="flex items-center gap-2">
            <label className={inputClass.replace('bg-input-background border border-border/10 rounded-lg px-2 py-1.5', '')}>
              {t('theoryAudio.tempo')}
            </label>
            <input
              type="number"
              min="20"
              max="240"
              value={audio?.tempo ?? 100}
              onChange={(event) => setTempo(Number(event.target.value))}
              className={`${inputClass} w-20`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            {(audio?.sequence ?? []).map((entry, index) => (
              <AudioEntryRow key={index} entry={entry} onChange={(patch) => updateEntry(index, patch)} onRemove={() => removeEntry(index)} />
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
            {(audio?.sequence ?? []).length > 0 && (
              <button
                type="button"
                onClick={() => playSequence(audio?.sequence ?? [], audio?.tempo)}
                className="flex items-center gap-1 text-primary text-xs font-medium ml-auto"
              >
                <Play size={14} />
                {t('theoryAudio.play')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface AudioEntryRowProps {
  entry: StaffNoteEntry;
  onChange: (patch: Partial<StaffNoteEntry>) => void;
  onRemove: () => void;
}

function AudioEntryRow({ entry, onChange, onRemove }: AudioEntryRowProps) {
  const { t } = useTranslation();
  const isRest = !entry.note;
  const parsed = parseNoteWithOctave(entry.note ?? 'C4');

  function setNotePart(part: Partial<{ letter: string; accidental: Accidental; octave: number }>) {
    const next = { ...parsed, ...part };
    const noteWithOctave = formatNoteWithOctave(next.letter, next.accidental, next.octave);
    playNote(noteWithOctave);
    onChange({ note: noteWithOctave });
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