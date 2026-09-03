import { useTranslation } from 'react-i18next';
import type { LessonStep } from '../../../../types/lessonStep';
import { PlayerCircleOfFifths } from '../PlayerCircleOfFifths';

interface CircleOfFifthsFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function CircleOfFifthsFields({ step, onChange }: CircleOfFifthsFieldsProps) {
  const { t } = useTranslation();
  const targetKey = (step.targetKey as string) ?? 'C';

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-muted-foreground text-xs self-start">{t('moduleForm.stepEditor.circleClickHint')}</p>
      <PlayerCircleOfFifths selectedKeys={[targetKey]} onToggleKey={(note) => onChange({ targetKey: note })} />
    </div>
  );
}