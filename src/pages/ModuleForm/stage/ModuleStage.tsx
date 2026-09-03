import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LessonStep, StepKind } from '../../../types/lessonStep';
import { createStep } from '../stepDefaults';
import { EditToolbar } from './EditToolbar';
import { WebStepEditor } from './WebStepEditor';
import { PhoneStage } from './PhoneStage';

interface ModuleStageProps {
  moduleTitle: string;
  onModuleTitleChange: (value: string) => void;
  orderIndex: string;
  onOrderIndexChange: (value: string) => void;
  xpReward: string;
  onXpRewardChange: (value: string) => void;
  steps: LessonStep[];
  onStepsChange: (steps: LessonStep[]) => void;
}

export function ModuleStage({
                              moduleTitle,
                              onModuleTitleChange,
                              orderIndex,
                              onOrderIndexChange,
                              xpReward,
                              onXpRewardChange,
                              steps,
                              onStepsChange,
                            }: ModuleStageProps) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const safeIndex = Math.min(stepIndex, Math.max(steps.length - 1, 0));
  const currentStep: LessonStep | undefined = steps[safeIndex];

  function updateStep(patch: Partial<LessonStep>) {
    if (!currentStep) return;
    const next = [...steps];
    next[safeIndex] = { ...next[safeIndex], ...patch };
    onStepsChange(next);
  }

  function changeStepKind(kind: StepKind) {
    if (!currentStep) return;
    const fresh = createStep(kind);
    const next = [...steps];
    next[safeIndex] = { ...fresh, title: currentStep.title };
    onStepsChange(next);
  }

  function addStep() {
    const insertAt = safeIndex + 1;
    const next = [...steps.slice(0, insertAt), createStep('THEORY'), ...steps.slice(insertAt)];
    onStepsChange(next);
    setStepIndex(insertAt);
  }

  function removeStep() {
    if (steps.length <= 1) return;
    const next = steps.filter((_, i) => i !== safeIndex);
    onStepsChange(next);
    setStepIndex(Math.max(0, safeIndex - 1));
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goPrev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  if (!currentStep) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            onStepsChange([createStep('THEORY')]);
            setStepIndex(0);
          }}
          className="py-3 px-6 rounded-xl font-bold text-primary-foreground bg-primary"
        >
          {t('stage.addStep')}
        </button>
      </div>
    );
  }

  const kind: StepKind = currentStep.type === 'THEORY' ? 'THEORY' : (currentStep.exerciseType ?? 'MULTIPLE_CHOICE');

  return (
    <div className="flex flex-col gap-4">
      <EditToolbar
        moduleTitle={moduleTitle}
        onModuleTitleChange={onModuleTitleChange}
        orderIndex={orderIndex}
        onOrderIndexChange={onOrderIndexChange}
        xpReward={xpReward}
        onXpRewardChange={onXpRewardChange}
        stepIndex={safeIndex}
        totalSteps={steps.length}
        onPrevStep={goPrev}
        onNextStep={goNext}
        stepKind={kind}
        onStepKindChange={changeStepKind}
        onAddStep={addStep}
        onRemoveStep={removeStep}
        canRemoveStep={steps.length > 1}
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen((v) => !v)}
      />

      <div className={`flex flex-col ${previewOpen ? 'md:flex-row' : ''} items-start gap-4`}>
        <div className={`w-full min-w-0 ${previewOpen ? 'md:w-1/2 xl:w-[70%]' : ''}`}>
          <WebStepEditor step={currentStep} kind={kind} onStepChange={updateStep} />
        </div>

        {previewOpen && (
          <div className="w-full md:w-1/2 xl:w-[30%] flex justify-center">
            <PhoneStage
              step={currentStep}
              kind={kind}
              stepIndex={safeIndex}
              totalSteps={steps.length}
              onNext={goNext}
              onClose={() => setPreviewOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}