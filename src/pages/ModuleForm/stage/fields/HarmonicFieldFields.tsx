import { useTranslation } from 'react-i18next';
import type { LessonStep } from '../../../../types/lessonStep';
import { CHROMATIC_SCALE, HARMONIC_FIELD_DEGREES } from '../../../../core/musicTheory';
import { inputClass, labelClass } from '../../stepEditorStyles';
import { PlayerHarmonicField } from '../PlayerHarmonicField';

interface HarmonicFieldFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function HarmonicFieldFields({ step, onChange }: HarmonicFieldFieldsProps) {
  const { t } = useTranslation();
  const key = (step.key as string) ?? 'C';
  const mode = (step.mode as 'major' | 'minor') ?? 'major';
  const targetDegree = (step.targetDegree as string) ?? HARMONIC_FIELD_DEGREES[mode][0];

  function handleModeChange(nextMode: 'major' | 'minor') {
    onChange({ mode: nextMode, targetDegree: HARMONIC_FIELD_DEGREES[nextMode][0] });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3 self-start">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldKey')}</label>
          <select value={key} onChange={(event) => onChange({ key: event.target.value })} className={inputClass}>
            {CHROMATIC_SCALE.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldMode')}</label>
          <select
            value={mode}
            onChange={(event) => handleModeChange(event.target.value as 'major' | 'minor')}
            className={inputClass}
          >
            <option value="major">{t('moduleForm.stepEditor.modeMajor')}</option>
            <option value="minor">{t('moduleForm.stepEditor.modeMinor')}</option>
          </select>
        </div>
      </div>
      <p className="text-muted-foreground text-xs self-start">{t('moduleForm.stepEditor.harmonicClickHint')}</p>
      <PlayerHarmonicField
        rootKey={key}
        mode={mode}
        selectedDegrees={[targetDegree]}
        onToggleDegree={(degree) => onChange({ targetDegree: degree })}
      />
    </div>
  );
}