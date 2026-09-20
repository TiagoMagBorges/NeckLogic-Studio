import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import type { LessonStep, TheoryAudioSequence, StaffNoteEntry } from '../../../../types/lessonStep';
import { playSequence } from '../../../../core/AudioEngine';
import { compactInputClass } from '../../stepEditorStyles';
import { StaffNoteRows } from './StaffNoteRows';

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
            <label className={compactInputClass.replace('bg-input-background border border-border/10 rounded-lg px-2 py-1.5', '')}>
              {t('theoryAudio.tempo')}
            </label>
            <input
              type="number"
              min="20"
              max="240"
              value={audio?.tempo ?? 100}
              onChange={(event) => setTempo(Number(event.target.value))}
              className={`${compactInputClass} w-20`}
            />
          </div>

          <StaffNoteRows notes={audio?.sequence ?? []} onNotesChange={updateSequence} />

          {(audio?.sequence ?? []).length > 0 && (
            <button
              type="button"
              onClick={() => playSequence(audio?.sequence ?? [], audio?.tempo)}
              className="flex items-center gap-1 text-primary text-xs font-medium self-start"
            >
              <Play size={14} />
              {t('theoryAudio.play')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
