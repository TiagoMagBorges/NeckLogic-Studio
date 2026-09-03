import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { LessonStep, FretPosition } from '../../../../types/lessonStep';
import { labelClass } from '../../stepEditorStyles';
import { PlayerFretboard } from '../PlayerFretboard';
import { positionKey } from '../positionKey';

interface SequenceFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function SequenceFields({ step, onChange }: SequenceFieldsProps) {
  const { t } = useTranslation();
  const targetSequence = (step.targetSequence as FretPosition[]) ?? [];

  function addPosition(stringNumber: number, fret: number) {
    onChange({ targetSequence: [...targetSequence, { string: stringNumber, fret }] });
  }

  function removeAt(index: number) {
    onChange({ targetSequence: targetSequence.filter((_, i) => i !== index) });
  }

  function clearAll() {
    onChange({ targetSequence: [] });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>{t('moduleForm.stepEditor.sequenceHint')}</label>
      <div className="rounded-lg overflow-hidden">
        <PlayerFretboard frets={12} notes={targetSequence} onCellClick={addPosition} />
      </div>

      {targetSequence.length === 0 ? (
        <p className="text-muted-foreground text-xs ml-1">{t('moduleForm.stepEditor.sequenceEmpty')}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {targetSequence.map((position, index) => (
            <span
              key={`${positionKey(position)}-${index}`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-mono"
            >
              {index + 1}. {t('moduleForm.stepEditor.positionLabel', { string: position.string, fret: position.fret })}
              <button type="button" onClick={() => removeAt(index)}>
                <X size={12} />
              </button>
            </span>
          ))}
          <button type="button" onClick={clearAll} className="text-xs text-destructive font-medium ml-1">
            {t('moduleForm.stepEditor.clearAll')}
          </button>
        </div>
      )}
    </div>
  );
}