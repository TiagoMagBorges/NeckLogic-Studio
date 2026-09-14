import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LessonStep, StepKind } from '../../../types/lessonStep';
import { createStep } from '../stepDefaults';
import { EditToolbar } from './EditToolbar';
import { WebStepEditor } from './WebStepEditor';
import { PhoneStage } from './PhoneStage';
import { StepRail } from './StepRail';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

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
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

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

  function confirmDelete() {
    if (deleteIndex === null) return;
    const index = deleteIndex;
    setDeleteIndex(null);
    const next = steps.filter((_, i) => i !== index);
    onStepsChange(next);
    setStepIndex((current) => (index <= current ? Math.max(0, current - 1) : current));
  }

  function reorderSteps(fromIndex: number, toIndex: number) {
    const next = [...steps];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onStepsChange(next);

    setStepIndex((current) => {
      if (current === fromIndex) return toIndex;
      if (fromIndex < current && toIndex >= current) return current - 1;
      if (fromIndex > current && toIndex <= current) return current + 1;
      return current;
    });
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
        stepKind={kind}
        onStepKindChange={changeStepKind}
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen((v) => !v)}
      />

      <div className="flex flex-col md:flex-row items-start gap-4">
        <StepRail
          steps={steps}
          currentIndex={safeIndex}
          onSelect={setStepIndex}
          onAddStep={addStep}
          onRequestDelete={setDeleteIndex}
          onReorder={reorderSteps}
          canDelete={steps.length > 1}
        />

        <div className={`flex flex-col ${previewOpen ? 'md:flex-row' : ''} items-start gap-4 flex-1 min-w-0 w-full`}>
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
                onNext={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))}
                onClose={() => setPreviewOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteIndex !== null}
        title={t('stage.deleteStepTitle')}
        message={
          deleteIndex !== null
            ? t('stage.deleteStepConfirm', {
                title: steps[deleteIndex]?.title || t('moduleForm.stepEditor.defaultDrillTitle'),
              })
            : ''
        }
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteIndex(null)}
      />
    </div>
  );
}
