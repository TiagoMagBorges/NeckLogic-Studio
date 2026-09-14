import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LessonStep } from '../../../../types/lessonStep';
import { CHROMATIC_SCALE, CHORD_QUALITY_KEYS, noteWithOctaveFromStringAndFret } from '../../../../core/musicTheory';
import { playNote } from '../../../../core/AudioEngine';
import { inputClass, labelClass } from '../../stepEditorStyles';
import { PlayerFretboard } from '../PlayerFretboard';
import { computeChordPreviewNotes } from '../chordPreview';
import type { FretboardNote } from '../PlayerFretboard';

interface ChordFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
  showInversion: boolean;
}

const COMMON_CHORD_TEMPLATES: { root: string; quality: string }[] = [
  { root: 'C', quality: 'major' },
  { root: 'G', quality: 'major' },
  { root: 'D', quality: 'major' },
  { root: 'A', quality: 'minor' },
  { root: 'E', quality: 'minor' },
  { root: 'F', quality: 'major' },
];

export function ChordFields({ step, onChange, showInversion }: ChordFieldsProps) {
  const { t } = useTranslation();
  const root = (step.root as string) ?? '';
  const quality = (step.quality as string) ?? '';
  const inversion = (step.inversion as number) ?? 0;
  const customShape = (step.chordShape as FretboardNote[] | undefined) ?? undefined;

  const hasChord = !!root && !!quality;
  const defaultNotes = hasChord ? computeChordPreviewNotes(root, quality) : [];
  const previewNotes = customShape ?? defaultNotes;

  function applyTemplate(templateRoot: string, templateQuality: string) {
    onChange({ root: templateRoot, quality: templateQuality, chordShape: undefined });
  }

  function toggleCell(stringNumber: number, fret: number) {
    const base = customShape ?? defaultNotes;
    const existingIndex = base.findIndex((note) => note.string === stringNumber && note.fret === fret);
    let nextShape: FretboardNote[];
    if (existingIndex >= 0) {
      nextShape = base.filter((_, index) => index !== existingIndex);
    } else {
      const withoutSameString = base.filter((note) => note.string !== stringNumber);
      nextShape = [...withoutSameString, { string: stringNumber, fret }];
    }
    onChange({ chordShape: nextShape });
  }

  function resetShape() {
    onChange({ chordShape: undefined });
  }

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
          <select
            value={root}
            onChange={(event) => onChange({ root: event.target.value, chordShape: undefined })}
            className={inputClass}
          >
            <option value="">{t('moduleForm.stepEditor.fieldRootPlaceholder')}</option>
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
            onChange={(event) => onChange({ quality: event.target.value, chordShape: undefined })}
            className={inputClass}
          >
            <option value="">{t('moduleForm.stepEditor.fieldQualityPlaceholder')}</option>
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

      <div className="flex flex-col gap-1">
        <label className={labelClass}>{t('moduleForm.stepEditor.chordTemplates')}</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_CHORD_TEMPLATES.map((template) => (
            <button
              key={`${template.root}-${template.quality}`}
              type="button"
              onClick={() => applyTemplate(template.root, template.quality)}
              className="px-3 py-1.5 rounded-lg border border-border/10 text-xs font-medium hover:bg-primary/10"
            >
              {template.root}
              {template.quality === 'minor' ? 'm' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <PlayerFretboard frets={24} notes={previewNotes} onCellClick={toggleCell} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{t('moduleForm.stepEditor.customShapeHint')}</p>
        {customShape && (
          <button type="button" onClick={resetShape} className="text-primary text-xs font-medium shrink-0">
            {t('moduleForm.stepEditor.resetShape')}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={playChord}
        disabled={previewNotes.length === 0}
        className="flex items-center gap-1.5 self-start text-primary text-xs font-medium disabled:opacity-50"
      >
        <Play size={14} />
        {t('moduleForm.stepEditor.playChord')}
      </button>
    </div>
  );
}