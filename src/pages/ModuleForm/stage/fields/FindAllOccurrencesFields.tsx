import { useTranslation } from 'react-i18next';
import type { LessonStep } from '../../../../types/lessonStep';
import { CHROMATIC_SCALE } from '../../../../core/musicTheory';
import { inputClass, labelClass } from '../../stepEditorStyles';

interface FindAllOccurrencesFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function FindAllOccurrencesFields({ step, onChange }: FindAllOccurrencesFieldsProps) {
  const { t } = useTranslation();
  const targetNote = (step.targetNote as string) ?? 'C';

  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>{t('moduleForm.stepEditor.fieldTargetNote')}</label>
      <select
        value={targetNote}
        onChange={(event) => onChange({ targetNote: event.target.value })}
        className={inputClass}
      >
        {CHROMATIC_SCALE.map((note) => (
          <option key={note} value={note}>
            {note}
          </option>
        ))}
      </select>
    </div>
  );
}