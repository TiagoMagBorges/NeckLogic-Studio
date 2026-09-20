import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Trash2, Undo2 } from 'lucide-react';
import type { NoteDuration, TabNoteEntry } from '../../../../types/lessonStep';
import { noteWithOctaveFromStringAndFret } from '../../../../core/musicTheory';
import { playNote, playTabSequence } from '../../../../core/AudioEngine';
import { PlayerFretboard } from '../players/PlayerFretboard';
import { PlayerTabDisplay } from '../players/PlayerTabDisplay';
import { DURATIONS } from '../../stepDefaults';

const DURATION_GLYPH: Record<NoteDuration, string> = {
  whole: '𝅝',
  half: '𝅗𝅥',
  quarter: '♩',
  eighth: '♪',
  sixteenth: '𝅘𝅥𝅯',
};

interface TabNoteBuilderProps {
  notes: TabNoteEntry[];
  beatsPerMeasure: number;
  onNotesChange: (notes: TabNoteEntry[]) => void;
}
export function TabNoteBuilder({ notes, beatsPerMeasure, onNotesChange }: TabNoteBuilderProps) {
  const { t } = useTranslation();
  const [activeDuration, setActiveDuration] = useState<NoteDuration>('quarter');
  const [activeDotted, setActiveDotted] = useState(false);
  const [restMode, setRestMode] = useState(false);

  function appendFromFretboard(stringNumber: number, fret: number) {
    if (restMode) {
      onNotesChange([...notes, { duration: activeDuration, dotted: activeDotted }]);
      return;
    }
    playNote(noteWithOctaveFromStringAndFret(stringNumber, fret));
    onNotesChange([...notes, { string: stringNumber, fret, duration: activeDuration, dotted: activeDotted }]);
  }

  function commitFromTab(index: number | null, stringNumber: number, fret: number) {
    playNote(noteWithOctaveFromStringAndFret(stringNumber, fret));
    if (index === null) {
      onNotesChange([...notes, { string: stringNumber, fret, duration: activeDuration, dotted: activeDotted }]);
    } else {
      const next = [...notes];
      next[index] = { ...next[index], string: stringNumber, fret };
      onNotesChange(next);
    }
  }

  function deleteFromTab(index: number) {
    onNotesChange(notes.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 flex-wrap bg-input-background border border-border/10 rounded-lg p-1.5">
        {DURATIONS.map((duration) => (
          <button
            key={duration}
            type="button"
            title={t(`moduleForm.stepEditor.duration${duration.charAt(0).toUpperCase()}${duration.slice(1)}`)}
            onClick={() => setActiveDuration(duration)}
            className={`w-9 h-8 rounded-md text-base font-medium ${
              activeDuration === duration ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            {DURATION_GLYPH[duration]}
          </button>
        ))}

        <span className="w-px self-stretch bg-border/10 mx-0.5" />

        <button
          type="button"
          title={t('moduleForm.stepEditor.dotted')}
          onClick={() => setActiveDotted((v) => !v)}
          className={`w-8 h-8 rounded-md text-sm font-bold ${
            activeDotted ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          ·
        </button>
        <button
          type="button"
          title={t('moduleForm.stepEditor.staffRestMode')}
          onClick={() => setRestMode((v) => !v)}
          className={`px-2 h-8 rounded-md text-xs font-medium flex items-center gap-1 ${
            restMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          𝄽 {t('moduleForm.stepEditor.isRest')}
        </button>
      </div>

      <PlayerTabDisplay
        notes={notes}
        beatsPerMeasure={beatsPerMeasure}
        interactive
        onCommitNote={commitFromTab}
        onDeleteNote={deleteFromTab}
      />

      <p className="text-muted-foreground text-xs ml-1">{t('moduleForm.stepEditor.tabClickHint')}</p>

      <div className="rounded-lg overflow-hidden">
        <PlayerFretboard frets={24} notes={[]} onCellClick={appendFromFretboard} />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => playTabSequence(notes)}
          disabled={notes.length === 0}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40"
        >
          <Play size={13} />
          {t('moduleForm.stepEditor.playSequence')}
        </button>
        <button
          type="button"
          onClick={() => onNotesChange(notes.slice(0, -1))}
          disabled={notes.length === 0}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-border/10 text-xs font-medium disabled:opacity-40"
        >
          <Undo2 size={13} />
          {t('moduleForm.stepEditor.undoLastNote')}
        </button>
        <button
          type="button"
          onClick={() => onNotesChange([])}
          disabled={notes.length === 0}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-border/10 text-xs font-medium disabled:opacity-40"
        >
          <Trash2 size={13} />
          {t('moduleForm.stepEditor.clearNotes')}
        </button>
      </div>
    </div>
  );
}
