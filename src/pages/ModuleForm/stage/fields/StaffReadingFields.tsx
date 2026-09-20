import { useTranslation } from 'react-i18next';
import type { LessonStep, StaffNoteEntry, ClefType } from '../../../../types/lessonStep';
import { inputClass, labelClass } from '../../stepEditorStyles';
import { StaffNoteBuilder } from '../builders/StaffNoteBuilder';
import { StaffNoteRows } from '../builders/StaffNoteRows';

interface StaffReadingFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function StaffReadingFields({ step, onChange }: StaffReadingFieldsProps) {
  const { t } = useTranslation();
  const clef = (step.clef as ClefType) ?? 'treble';
  const beatsPerMeasure = (step.beatsPerMeasure as number) ?? 4;
  const staffNotes = (step.staffNotes as StaffNoteEntry[]) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldClef')}</label>
          <select value={clef} onChange={(event) => onChange({ clef: event.target.value })} className={inputClass}>
            <option value="treble">{t('moduleForm.stepEditor.clefTreble')}</option>
            <option value="bass">{t('moduleForm.stepEditor.clefBass')}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldBeatsPerMeasure')}</label>
          <input
            type="number"
            min="1"
            value={beatsPerMeasure}
            onChange={(event) => onChange({ beatsPerMeasure: Number(event.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <StaffNoteBuilder
        notes={staffNotes}
        clef={clef}
        beatsPerMeasure={beatsPerMeasure}
        onNotesChange={(next) => onChange({ staffNotes: next })}
      />

      <StaffNoteRows notes={staffNotes} onNotesChange={(next) => onChange({ staffNotes: next })} showTarget />
    </div>
  );
}
