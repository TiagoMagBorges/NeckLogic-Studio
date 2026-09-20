import { useTranslation } from 'react-i18next';
import type { LessonStep, TabNoteEntry } from '../../../../types/lessonStep';
import { inputClass, labelClass } from '../../stepEditorStyles';
import { TabNoteBuilder } from '../builders/TabNoteBuilder';
import { TabNoteRows } from '../builders/TabNoteRows';

interface TabReadingFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function TabReadingFields({ step, onChange }: TabReadingFieldsProps) {
  const { t } = useTranslation();
  const beatsPerMeasure = (step.beatsPerMeasure as number) ?? 4;
  const tabNotes = (step.tabNotes as TabNoteEntry[]) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 max-w-[200px]">
        <label className={labelClass}>{t('moduleForm.stepEditor.fieldBeatsPerMeasure')}</label>
        <input
          type="number"
          min="1"
          value={beatsPerMeasure}
          onChange={(event) => onChange({ beatsPerMeasure: Number(event.target.value) })}
          className={inputClass}
        />
      </div>

      <TabNoteBuilder notes={tabNotes} beatsPerMeasure={beatsPerMeasure} onNotesChange={(next) => onChange({ tabNotes: next })} />

      <TabNoteRows notes={tabNotes} onNotesChange={(next) => onChange({ tabNotes: next })} />
    </div>
  );
}
