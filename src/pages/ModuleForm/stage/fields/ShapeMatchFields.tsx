import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { LessonStep, FretPosition } from '../../../../types/lessonStep';
import { CHROMATIC_SCALE, noteWithOctaveFromStringAndFret } from '../../../../core/musicTheory';
import { playNote } from '../../../../core/AudioEngine';
import { inputClass, labelClass } from '../../stepEditorStyles';
import { PlayerFretboard } from '../PlayerFretboard';
import { positionKey } from '../positionKey';

type ShapeMatchMode = 'note' | 'notes' | 'shape';

function detectMode(step: LessonStep): ShapeMatchMode {
  if (Array.isArray(step.targetShape)) return 'shape';
  if (Array.isArray(step.targetNotes)) return 'notes';
  return 'note';
}

interface ShapeMatchFieldsProps {
  step: LessonStep;
  onChange: (patch: Partial<LessonStep>) => void;
}

export function ShapeMatchFields({ step, onChange }: ShapeMatchFieldsProps) {
  const { t } = useTranslation();
  const mode = detectMode(step);

  function switchMode(nextMode: ShapeMatchMode) {
    if (nextMode === 'note') {
      onChange({ targetNote: (step.targetNote as string) ?? 'C', targetNotes: undefined, targetShape: undefined });
    } else if (nextMode === 'notes') {
      onChange({ targetNote: undefined, targetNotes: (step.targetNotes as string[]) ?? [], targetShape: undefined });
    } else {
      onChange({ targetNote: undefined, targetNotes: undefined, targetShape: (step.targetShape as FretPosition[]) ?? [] });
    }
  }

  const targetNote = (step.targetNote as string) ?? 'C';
  const targetNotes = (step.targetNotes as string[]) ?? [];
  const targetShape = (step.targetShape as FretPosition[]) ?? [];

  function toggleNote(note: string) {
    playNote(`${note}4`);
    const next = targetNotes.includes(note) ? targetNotes.filter((n) => n !== note) : [...targetNotes, note];
    onChange({ targetNotes: next });
  }

  function toggleShapePosition(stringNumber: number, fret: number) {
    playNote(noteWithOctaveFromStringAndFret(stringNumber, fret));
    const position = { string: stringNumber, fret };
    const exists = targetShape.some((p) => positionKey(p) === positionKey(position));
    const next = exists ? targetShape.filter((p) => positionKey(p) !== positionKey(position)) : [...targetShape, position];
    onChange({ targetShape: next });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>{t('moduleForm.stepEditor.shapeMatchMode')}</label>
        <select
          value={mode}
          onChange={(event) => switchMode(event.target.value as ShapeMatchMode)}
          className={inputClass}
        >
          <option value="note">{t('moduleForm.stepEditor.shapeMatchModeNote')}</option>
          <option value="notes">{t('moduleForm.stepEditor.shapeMatchModeNotes')}</option>
          <option value="shape">{t('moduleForm.stepEditor.shapeMatchModeShape')}</option>
        </select>
      </div>

      {mode === 'note' && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldTargetNote')}</label>
          <select
            value={targetNote}
            onChange={(event) => {
              playNote(`${event.target.value}4`);
              onChange({ targetNote: event.target.value });
            }}
            className={inputClass}
          >
            {CHROMATIC_SCALE.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'notes' && (
        <div className="flex flex-col gap-2">
          <label className={labelClass}>{t('moduleForm.stepEditor.fieldTargetNotes')}</label>
          <div className="flex flex-wrap gap-2">
            {CHROMATIC_SCALE.map((note) => {
              const active = targetNotes.includes(note);
              return (
                <button
                  key={note}
                  type="button"
                  onClick={() => toggleNote(note)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono border ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-input-background text-muted-foreground border-border/10'
                  }`}
                >
                  {note}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'shape' && (
        <div className="flex flex-col gap-2">
          <label className={labelClass}>{t('moduleForm.stepEditor.fretboardHint')}</label>
          <div className="rounded-lg overflow-hidden">
            <PlayerFretboard
              frets={12}
              notes={targetShape.map((p) => ({ ...p }))}
              onCellClick={toggleShapePosition}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {targetShape.map((position) => (
              <span
                key={positionKey(position)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-mono"
              >
                {t('moduleForm.stepEditor.positionLabel', { string: position.string, fret: position.fret })}
                <button type="button" onClick={() => toggleShapePosition(position.string, position.fret)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}