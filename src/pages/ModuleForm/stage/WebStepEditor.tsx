import { useTranslation } from 'react-i18next';
import { Image as ImageIcon } from 'lucide-react';
import type { LessonStep, StepKind } from '../../../types/lessonStep';
import { stepLabel } from '../stepDefaults';
import { inputClass, labelClass } from '../stepEditorStyles';
import { TheoryIllustrationBuilder } from './TheoryIllustrationBuilder';
import { AudioSequenceBuilder } from './AudioSequenceBuilder';
import { MultipleChoiceFields } from './fields/MultipleChoiceFields';
import { ChordFields } from './fields/ChordFields';
import { CircleOfFifthsFields } from './fields/CircleOfFifthsFields';
import { HarmonicFieldFields } from './fields/HarmonicFieldFields';
import { ShapeMatchFields } from './fields/ShapeMatchFields';
import { FindAllOccurrencesFields } from './fields/FindAllOccurrencesFields';
import { SequenceFields } from './fields/SequenceFields';
import { StaffReadingFields } from './fields/StaffReadingFields';

const SEQUENCE_KINDS: StepKind[] = ['SCALE_DEGREES', 'ARPEGGIO', 'TAB_READING'];

interface WebStepEditorProps {
  step: LessonStep;
  kind: StepKind;
  onStepChange: (patch: Partial<LessonStep>) => void;
}

export function WebStepEditor({ step, kind, onStepChange }: WebStepEditorProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border/10 rounded-2xl p-6 flex flex-col gap-4">
      <span className="self-start text-[10.5px] font-bold uppercase tracking-wide text-primary bg-primary/10 border border-primary/30 rounded-full px-2.5 py-1">
        {stepLabel(kind)}
      </span>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">{t('moduleForm.stepEditor.fieldTitle')}</label>
        <input
          className="text-xl font-bold bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary"
          value={step.title ?? ''}
          onChange={(event) => onStepChange({ title: event.target.value })}
        />
      </div>

      {kind === 'THEORY' ? (
        <TheoryStepFields step={step} onStepChange={onStepChange} />
      ) : (
        <ExerciseStepFields step={step} kind={kind} onStepChange={onStepChange} />
      )}
    </div>
  );
}

function TheoryStepFields({ step, onStepChange }: { step: LessonStep; onStepChange: (patch: Partial<LessonStep>) => void }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">{t('moduleForm.stepEditor.fieldText')}</label>
        <textarea
          className="bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] leading-relaxed resize-y focus:outline-none focus:border-primary"
          rows={5}
          value={(step.text as string) ?? ''}
          onChange={(event) => onStepChange({ text: event.target.value })}
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground ml-1">{t('stage.imageUrlLabel')}</span>
        <div className="flex items-center gap-2 bg-input-background border border-border/10 rounded-xl px-4 py-3 focus-within:border-primary">
          <ImageIcon size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={(step.imageUrl as string) ?? ''}
            onChange={(event) => onStepChange({ imageUrl: event.target.value || undefined })}
            placeholder={t('stage.addImage')}
            className="flex-1 bg-transparent border-none outline-none text-foreground text-[15px]"
          />
        </div>
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground ml-1">{t('theoryIllustration.label')}</span>
        <TheoryIllustrationBuilder step={step} onChange={onStepChange} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground ml-1">{t('theoryAudio.label')}</span>
        <AudioSequenceBuilder step={step} onChange={onStepChange} />
      </div>
    </>
  );
}

function ExerciseStepFields({
                              step,
                              kind,
                              onStepChange,
                            }: {
  step: LessonStep;
  kind: StepKind;
  onStepChange: (patch: Partial<LessonStep>) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {kind !== 'STAFF_READING' && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldQuestion')}</label>
          <input
            type="text"
            value={(step.question as string) ?? ''}
            onChange={(event) => onStepChange({ question: event.target.value })}
            className={inputClass}
          />
        </div>
      )}

      {kind === 'MULTIPLE_CHOICE' && <MultipleChoiceFields step={step} onChange={onStepChange} />}
      {kind === 'CHORD_BUILD' && <ChordFields step={step} onChange={onStepChange} showInversion={false} />}
      {kind === 'TRIAD_INVERSION' && <ChordFields step={step} onChange={onStepChange} showInversion />}
      {kind === 'CIRCLE_OF_FIFTHS' && <CircleOfFifthsFields step={step} onChange={onStepChange} />}
      {kind === 'HARMONIC_FIELD' && <HarmonicFieldFields step={step} onChange={onStepChange} />}
      {kind === 'SHAPE_MATCH' && <ShapeMatchFields step={step} onChange={onStepChange} />}
      {kind === 'FIND_ALL_OCCURRENCES' && <FindAllOccurrencesFields step={step} onChange={onStepChange} />}
      {SEQUENCE_KINDS.includes(kind) && <SequenceFields step={step} onChange={onStepChange} />}
      {kind === 'STAFF_READING' && <StaffReadingFields step={step} onChange={onStepChange} />}
    </>
  );
}