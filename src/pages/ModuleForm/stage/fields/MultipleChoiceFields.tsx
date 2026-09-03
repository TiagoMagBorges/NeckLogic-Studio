import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LessonStep } from '../../../../types/lessonStep';
import { inputClass, labelClass } from '../../stepEditorStyles';

interface MultipleChoiceFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function MultipleChoiceFields({ step, onChange }: MultipleChoiceFieldsProps) {
  const { t } = useTranslation();
  const options = (step.options as string[]) ?? [];
  const correctAnswer = (step.correctAnswer as string) ?? '';

  function setOption(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    onChange({ options: next });
  }

  function addOption() {
    onChange({ options: [...options, ''] });
  }

  function removeOption(index: number) {
    const next = options.filter((_, i) => i !== index);
    const nextCorrect = options[index] === correctAnswer ? '' : correctAnswer;
    onChange({ options: next, correctAnswer: nextCorrect });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>{t('moduleForm.stepEditor.fieldOptions')}</label>
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${step.title}-${index}`}
            checked={option !== '' && option === correctAnswer}
            onChange={() => onChange({ correctAnswer: option })}
          />
          <input
            type="text"
            value={option}
            onChange={(event) => setOption(index, event.target.value)}
            placeholder={t('moduleForm.stepEditor.optionPlaceholder', { index: index + 1 })}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => removeOption(index)}
            className="p-1.5 rounded-lg border border-destructive/40 text-destructive shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="self-start flex items-center gap-1 text-primary text-xs font-medium"
      >
        <Plus size={14} />
        {t('moduleForm.stepEditor.addOption')}
      </button>
      <p className="text-muted-foreground text-xs ml-1">{t('moduleForm.stepEditor.optionHint')}</p>
    </div>
  );
}