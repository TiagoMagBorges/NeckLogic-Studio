import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Trash2, Undo2 } from 'lucide-react';
import type { ClefType, NoteDuration, StaffNoteEntry } from '../../../../types/lessonStep';
import { parseNoteWithOctave, formatNoteWithOctave, noteFromStaffStep } from '../../../../core/musicTheory';
import type { Accidental } from '../../../../core/musicTheory';
import { ACCIDENTALS } from '../../../../core/musicTheory';
import { playNote, playSequence } from '../../../../core/AudioEngine';
import { PlayerStaffDisplay } from '../players/PlayerStaffDisplay';
import { DURATIONS } from '../../stepDefaults';

const DURATION_GLYPH: Record<NoteDuration, string> = {
  whole: '𝅝',
  half: '𝅗𝅥',
  quarter: '♩',
  eighth: '♪',
  sixteenth: '𝅘𝅥𝅯',
};
const ACCIDENTAL_GLYPH: Record<Accidental, string> = { natural: '♮', sharp: '♯', flat: '♭' };

interface StaffNoteBuilderProps {
  notes: StaffNoteEntry[];
  clef: ClefType;
  beatsPerMeasure: number;
  onNotesChange: (notes: StaffNoteEntry[]) => void;
}

/** Click-to-place staff builder: pick a duration/accidental on the toolbar, then click the staff to append a note or rest. */
export function StaffNoteBuilder({ notes, clef, beatsPerMeasure, onNotesChange }: StaffNoteBuilderProps) {
  const { t } = useTranslation();
  const [activeDuration, setActiveDuration] = useState<NoteDuration>('quarter');
  const [activeDotted, setActiveDotted] = useState(false);
  const [activeAccidental, setActiveAccidental] = useState<Accidental>('natural');
  const [restMode, setRestMode] = useState(false);

  function handleStaffClick(stepValue: number) {
    if (restMode) {
      onNotesChange([...notes, { duration: activeDuration, dotted: activeDotted }]);
      return;
    }

    const naturalNote = noteFromStaffStep(stepValue, clef);
    const parsed = parseNoteWithOctave(naturalNote);
    const note = formatNoteWithOctave(parsed.letter, activeAccidental, parsed.octave);
    playNote(note);
    onNotesChange([...notes, { note, duration: activeDuration, dotted: activeDotted }]);
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

        <span className="w-px self-stretch bg-border/10 mx-0.5" />

        {ACCIDENTALS.map((accidental) => (
          <button
            key={accidental}
            type="button"
            title={t(`moduleForm.stepEditor.accidental${accidental.charAt(0).toUpperCase()}${accidental.slice(1)}`)}
            onClick={() => setActiveAccidental(accidental)}
            className={`w-8 h-8 rounded-md text-base ${
              activeAccidental === accidental ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            {ACCIDENTAL_GLYPH[accidental]}
          </button>
        ))}
      </div>

      <PlayerStaffDisplay notes={notes} clef={clef} beatsPerMeasure={beatsPerMeasure} onStaffClick={handleStaffClick} />

      <p className="text-muted-foreground text-xs ml-1">{t('moduleForm.stepEditor.staffClickHint')}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => playSequence(notes)}
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
