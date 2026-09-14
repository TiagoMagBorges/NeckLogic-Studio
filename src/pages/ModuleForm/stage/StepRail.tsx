import { useState } from 'react';
import type { DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  ListChecks,
  Guitar,
  Repeat,
  CircleDot,
  Grid3x3,
  Target,
  Search,
  TrendingUp,
  Music2,
  FileText,
  Music4,
  GripVertical,
  Trash2,
  Plus,
} from 'lucide-react';
import type { LessonStep, StepKind } from '../../../types/lessonStep';
import { stepLabel } from '../stepDefaults';

const STEP_ICONS: Record<StepKind, typeof BookOpen> = {
  THEORY: BookOpen,
  MULTIPLE_CHOICE: ListChecks,
  CHORD_BUILD: Guitar,
  TRIAD_INVERSION: Repeat,
  CIRCLE_OF_FIFTHS: CircleDot,
  HARMONIC_FIELD: Grid3x3,
  SHAPE_MATCH: Target,
  FIND_ALL_OCCURRENCES: Search,
  SCALE_DEGREES: TrendingUp,
  ARPEGGIO: Music2,
  TAB_READING: FileText,
  STAFF_READING: Music4,
};

function kindOf(step: LessonStep): StepKind {
  return step.type === 'THEORY' ? 'THEORY' : (step.exerciseType ?? 'MULTIPLE_CHOICE');
}

interface StepRailProps {
  steps: LessonStep[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAddStep: () => void;
  onRequestDelete: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  canDelete: boolean;
}

export function StepRail({ steps, currentIndex, onSelect, onAddStep, onRequestDelete, onReorder, canDelete }: StepRailProps) {
  const { t } = useTranslation();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDragStart(event: DragEvent<HTMLDivElement>, index: number) {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, index: number) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setOverIndex(index);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, index: number) {
    event.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      onReorder(dragIndex, index);
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="w-full md:w-[224px] shrink-0 bg-card border border-border/10 rounded-2xl p-2.5 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold px-1.5 pt-1 pb-1.5">
        {t('stage.stepsCount', { count: steps.length })}
      </span>

      {steps.map((step, index) => {
        const kind = kindOf(step);
        const Icon = STEP_ICONS[kind];
        const isActive = index === currentIndex;
        const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

        return (
          <div
            key={index}
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDragOver={(event) => handleDragOver(event, index)}
            onDrop={(event) => handleDrop(event, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(index)}
            className={`group flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer border ${
              isActive
                ? 'bg-primary/10 border-primary/35'
                : isDropTarget
                  ? 'bg-secondary/60 border-primary/20'
                  : 'border-transparent hover:bg-secondary/60'
            }`}
          >
            <GripVertical size={13} className="text-muted-foreground shrink-0 cursor-grab" />
            <span className="font-mono text-[10px] text-muted-foreground w-3.5 shrink-0">{index + 1}</span>
            <span
              className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center shrink-0 ${
                isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-primary'
              }`}
            >
              <Icon size={13} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold truncate">{step.title || stepLabel(kind)}</span>
              <span className="block text-[10px] text-muted-foreground truncate">{stepLabel(kind)}</span>
            </span>
            {canDelete && (
              <button
                type="button"
                title={t('stage.deleteStep')}
                onClick={(event) => {
                  event.stopPropagation();
                  onRequestDelete(index);
                }}
                className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAddStep}
        className="flex items-center justify-center gap-1.5 mt-1 py-2 rounded-xl border border-dashed border-border/20 text-muted-foreground text-xs font-bold hover:border-primary/40 hover:text-primary"
      >
        <Plus size={13} />
        {t('stage.addStep')}
      </button>
    </div>
  );
}
