import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { LessonStep, StepKind } from '../../../types/lessonStep';
import { stepLabel } from '../stepDefaults';
import { TheoryIllustrationView } from './TheoryIllustrationView';
import { ExercisePreview } from './ExercisePreview';

interface PhoneStageProps {
  step: LessonStep;
  kind: StepKind;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onClose: () => void;
}

export function PhoneStage({ step, kind, stepIndex, totalSteps, onNext, onClose }: PhoneStageProps) {
  const { t } = useTranslation();
  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [step.imageUrl]);

  return (
    <div className="w-full max-w-[412px] bg-card border border-border/10 rounded-[34px] shadow-2xl overflow-hidden flex flex-col min-h-[640px]">
      <div className="flex items-center gap-3.5 px-[18px] pt-5 pb-3.5">
        <button type="button" onClick={onClose} className="text-muted-foreground w-6 h-6 flex items-center justify-center">
          <X size={20} />
        </button>
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="w-6" />
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-4 overflow-y-auto">
        <span className="self-start text-[10.5px] font-bold uppercase tracking-wide text-primary bg-primary/10 border border-primary/30 rounded-full px-2.5 py-1">
          {stepLabel(kind)}
        </span>

        {step.imageUrl && kind === 'THEORY' && (
          <div className="h-[110px] rounded-xl bg-input-background flex items-center justify-center text-muted-foreground text-xs px-4 text-center overflow-hidden">
            {imageFailed ? (
              <span>{t('stage.imageUnavailable')}</span>
            ) : (
              <img
                src={step.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImageFailed(true)}
              />
            )}
          </div>
        )}

        <p className="text-[23px] font-extrabold tracking-tight">{step.title}</p>

        {kind === 'THEORY' ? (
          <>
            {step.text && <p className="text-[14.5px] leading-relaxed text-foreground/85 whitespace-pre-wrap">{step.text}</p>}
            {step.illustration && <TheoryIllustrationView illustration={step.illustration} />}
          </>
        ) : (
          <ExercisePreview step={step} kind={kind} />
        )}
      </div>

      <div className="px-6 pb-[22px] pt-3.5 border-t border-border/10">
        <button
          type="button"
          onClick={isLastStep ? onClose : onNext}
          className="w-full py-[15px] rounded-2xl font-extrabold text-[15px] bg-primary text-primary-foreground"
        >
          {isLastStep ? t('stage.close') : t('stage.next')}
        </button>
      </div>
    </div>
  );
}