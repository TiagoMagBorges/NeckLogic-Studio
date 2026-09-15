import i18n from '../../i18n';
import type { LessonStep, StepKind } from '../../types/lessonStep';

export const STEP_KINDS: StepKind[] = [
  'THEORY',
  'MULTIPLE_CHOICE',
  'CHORD_BUILD',
  'TRIAD_INVERSION',
  'CIRCLE_OF_FIFTHS',
  'HARMONIC_FIELD',
  'SHAPE_MATCH',
  'FIND_ALL_OCCURRENCES',
  'SCALE_DEGREES',
  'ARPEGGIO',
  'TAB_READING',
  'STAFF_READING',
];

export function createStep(kind: StepKind): LessonStep {
  if (kind === 'THEORY') {
    return { type: 'THEORY', title: i18n.t('moduleForm.stepEditor.defaultTheoryTitle'), text: '' };
  }

  const base: LessonStep = {
    type: 'DRILL',
    exerciseType: kind,
    title: i18n.t('moduleForm.stepEditor.defaultDrillTitle'),
  };

  switch (kind) {
    case 'MULTIPLE_CHOICE':
      return { ...base, question: '', options: ['', ''], correctAnswer: '' };
    case 'CHORD_BUILD':
      return { ...base, root: '', quality: '' };
    case 'TRIAD_INVERSION':
      return { ...base, root: '', quality: '', inversion: 0 };
    case 'CIRCLE_OF_FIFTHS':
      return { ...base, question: '', targetKey: 'C' };
    case 'HARMONIC_FIELD':
      return { ...base, question: '', key: 'C', mode: 'major', targetDegree: 'I' };
    case 'SHAPE_MATCH':
      return { ...base, targetNote: 'C' };
    case 'FIND_ALL_OCCURRENCES':
      return { ...base, targetNote: 'C' };
    case 'SCALE_DEGREES':
    case 'ARPEGGIO':
    case 'TAB_READING':
      return { ...base, targetSequence: [] };
    case 'STAFF_READING':
      return { ...base, staffNotes: [] };
    default:
      return { ...base, question: '' };
  }
}

export function stepLabel(kind: StepKind): string {
  return i18n.t(`moduleForm.stepKinds.${kind}`);
}