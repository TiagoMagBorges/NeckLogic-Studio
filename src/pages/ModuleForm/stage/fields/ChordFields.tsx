import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LessonStep } from '../../../../types/lessonStep';
import { CHROMATIC_SCALE, CHORD_QUALITY_KEYS, noteWithOctaveFromStringAndFret } from '../../../../core/musicTheory';
import { playNote } from '../../../../core/AudioEngine';
import { inputClass, labelClass } from '../../stepEditorStyles';
import { PlayerFretboard } from '../PlayerFretboard';
import { computeChordPreviewNotes } from '../chordPreview';

interface ChordFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
  showInversion: boolean;
}

export function ChordFields({ step, onChange, showInversion }: ChordFieldsProps) {
  const { t } = useTranslation();
  const root = (step.root as string) ?? 'C';
  const quality = (step.quality as string) ?? 'major';
  const inversion = (step.inversion as number) ?? 0;

  const previewNotes = computeChordPreviewNotes(root, quality);

  function playChord() {
    previewNotes.forEach((note, index) => {
      setTimeout(() => playNote(noteWithOctaveFromStringAndFret(note.string, note.fret)), index * 120);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldRoot')}</label>
          <select value={root} onChange={(event) => onChange({ root: event.target.value })} className={inputClass}>
            {CHROMATIC_SCALE.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldQuality')}</label>
          <select
            value={quality}
            onChange={(event) => onChange({ quality: event.target.value })}
            className={inputClass}
          >
            {CHORD_QUALITY_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`moduleForm.chordQuality.${key}`)}
              </option>
            ))}
          </select>
        </div>
        {showInversion && (
          <div className="flex flex-col gap-1 flex-1">
            <label className={labelClass}>{t('moduleForm.stepEditor.fieldInversion')}</label>
            <select
              value={inversion}
              onChange={(event) => onChange({ inversion: Number(event.target.value) })}
              className={inputClass}
            >
              <option value={0}>{t('moduleForm.stepEditor.inversionRoot')}</option>
              <option value={1}>{t('moduleForm.stepEditor.inversionFirst')}</option>
              <option value={2}>{t('moduleForm.stepEditor.inversionSecond')}</option>
              <option value={3}>{t('moduleForm.stepEditor.inversionThird')}</option>
            </select>
          </div>
        )}
      </div>

      <div className="rounded-lg overflow-hidden">
        <PlayerFretboard frets={12} notes={previewNotes} />
      </div>

      <button
        type="button"
        onClick={playChord}
        className="flex items-center gap-1.5 self-start text-primary text-xs font-medium"
      >
        <Play size={14} />
        {t('moduleForm.stepEditor.playChord')}
      </button>
    </div>
  );
}