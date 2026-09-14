import { useTranslation } from 'react-i18next';
import { Smartphone } from 'lucide-react';
import type { StepKind } from '../../../types/lessonStep';
import { SIMPLE_STEP_KINDS, ADVANCED_STEP_KINDS, stepLabel } from '../stepDefaults';

const inputClass =
  'bg-input-background border border-border/10 rounded-lg px-2 py-1.5 text-foreground text-xs focus:outline-none focus:border-primary';

const numericInputClass = `${inputClass} font-mono`;

interface EditToolbarProps {
  moduleTitle: string;
  onModuleTitleChange: (value: string) => void;
  orderIndex: string;
  onOrderIndexChange: (value: string) => void;
  xpReward: string;
  onXpRewardChange: (value: string) => void;
  stepKind: StepKind;
  onStepKindChange: (kind: StepKind) => void;
  previewOpen: boolean;
  onTogglePreview: () => void;
}

export function EditToolbar({
                              moduleTitle,
                              onModuleTitleChange,
                              orderIndex,
                              onOrderIndexChange,
                              xpReward,
                              onXpRewardChange,
                              stepKind,
                              onStepKindChange,
                              previewOpen,
                              onTogglePreview,
                            }: EditToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-card border border-border/10 rounded-2xl p-3 flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={moduleTitle}
        onChange={(event) => onModuleTitleChange(event.target.value)}
        title={t('stage.moduleTitleLabel')}
        className={`${inputClass} flex-1 min-w-[160px]`}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{t('stage.orderLabel')}</span>
        <input
          type="text"
          value={orderIndex}
          onChange={(event) => onOrderIndexChange(event.target.value)}
          className={`${numericInputClass} w-12 text-center`}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{t('stage.xpLabel')}</span>
        <input
          type="text"
          value={xpReward}
          onChange={(event) => onXpRewardChange(event.target.value)}
          className={`${numericInputClass} w-12 text-center`}
        />
      </div>

      <select
        value={stepKind}
        onChange={(event) => onStepKindChange(event.target.value as StepKind)}
        className={`${inputClass} min-w-[180px]`}
      >
        <optgroup label={t('moduleForm.stepEditor.groupSimple')}>
          {SIMPLE_STEP_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {stepLabel(kind)}
            </option>
          ))}
        </optgroup>
        <optgroup label={t('moduleForm.stepEditor.groupAdvanced')}>
          {ADVANCED_STEP_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {stepLabel(kind)}
            </option>
          ))}
        </optgroup>
      </select>

      <button
        type="button"
        onClick={onTogglePreview}
        className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
          previewOpen
            ? 'border-primary text-primary bg-primary/10'
            : 'border-border/10 text-muted-foreground'
        }`}
      >
        <Smartphone size={14} />
        {t('stage.viewAsStudent')}
      </button>
    </div>
  );
}
