import { Fragment, useMemo } from 'react';
import type { ClefType, NoteDuration, StaffNoteEntry } from '../../../types/lessonStep';
import { getStaffStep, getDurationBeats, parseNoteWithOctave } from '../../../core/musicTheory';

interface PlayerStaffDisplayProps {
  notes: StaffNoteEntry[];
  clef?: ClefType;
  beatsPerMeasure?: number;
}

const STEP_HEIGHT = 7;
const BEAT_WIDTH = 48;
const NOTE_INSET = 14;
const LEFT_MARGIN = 48;
const RIGHT_PADDING = 24;
const TOP_MARGIN = 44;
const STEM_LENGTH = 30;
const NOTE_COLOR = '#00D9FF';
const LINE_COLOR = '#71717A';
const BARLINE_COLOR = '#52525B';

const CLEF_CONFIG: Record<ClefType, { glyph: string; fontSize: number; yOffsetSteps: number; label: string }> = {
  treble: { glyph: '𝄞', fontSize: 26, yOffsetSteps: 3, label: 'Clave de Sol' },
  bass: { glyph: '𝄢', fontSize: 22, yOffsetSteps: 5.5, label: 'Clave de Fá' },
};

const ACCIDENTAL_SYMBOL: Record<string, string> = { sharp: '♯', flat: '♭' };

function getLedgerSteps(step: number): number[] {
  const result: number[] = [];
  if (step < 0) {
    for (let s = -2; s >= step; s -= 2) result.push(s);
  } else if (step > 8) {
    for (let s = 10; s <= step; s += 2) result.push(s);
  }
  return result;
}

function NoteHead({ x, y, duration }: { x: number; y: number; duration: NoteDuration }) {
  const isOpen = duration === 'whole' || duration === 'half';
  return <circle cx={x} cy={y} r={5.5} fill={isOpen ? 'none' : NOTE_COLOR} stroke={NOTE_COLOR} strokeWidth={isOpen ? 2 : 0} />;
}

function NoteStem({ x, y, duration, stemUp }: { x: number; y: number; duration: NoteDuration; stemUp: boolean }) {
  if (duration === 'whole') return null;

  const stemX = x + (stemUp ? 5.5 : -5.5);
  const tipY = y + (stemUp ? -STEM_LENGTH : STEM_LENGTH);
  const flagCount = duration === 'eighth' ? 1 : duration === 'sixteenth' ? 2 : 0;

  return (
    <>
      <line x1={stemX} y1={y} x2={stemX} y2={tipY} stroke={NOTE_COLOR} strokeWidth={1.5} />
      {Array.from({ length: flagCount }, (_, i) => {
        const flagY = tipY + (stemUp ? i * 7 : -i * 7);
        const d = stemUp
          ? `M ${stemX} ${flagY} Q ${stemX + 10} ${flagY + 4} ${stemX + 8} ${flagY + 14} Q ${stemX + 3} ${flagY + 8} ${stemX} ${flagY + 2} Z`
          : `M ${stemX} ${flagY} Q ${stemX + 10} ${flagY - 4} ${stemX + 8} ${flagY - 14} Q ${stemX + 3} ${flagY - 8} ${stemX} ${flagY - 2} Z`;
        return <path key={`flag-${i}`} d={d} fill={NOTE_COLOR} />;
      })}
    </>
  );
}

function RestGlyph({ x, y, duration }: { x: number; y: number; duration: NoteDuration }) {
  switch (duration) {
    case 'whole':
      return <rect x={x - 6} y={y - 12} width={12} height={5} fill={LINE_COLOR} />;
    case 'half':
      return <rect x={x - 6} y={y - 4} width={12} height={5} fill={LINE_COLOR} />;
    case 'eighth':
    case 'sixteenth': {
      const hooks = duration === 'sixteenth' ? 2 : 1;
      return (
        <>
          <circle cx={x - 4} cy={y + 10} r={2.5} fill={LINE_COLOR} />
          <line x1={x - 2} y1={y + 9} x2={x + 6} y2={y - 12} stroke={LINE_COLOR} strokeWidth={1.5} />
          {Array.from({ length: hooks }, (_, i) => (
            <path key={`hook-${i}`} d={`M ${x + 6} ${y - 12 + i * 6} q 6 2 4 8 q -4 -1 -5 -5 z`} fill={LINE_COLOR} />
          ))}
        </>
      );
    }
    case 'quarter':
    default:
      return (
        <path
          d={`M ${x - 3} ${y - 12} L ${x + 3} ${y - 4} L ${x - 3} ${y + 2} L ${x + 2} ${y + 4} L ${x - 4} ${y + 12}`}
          stroke={LINE_COLOR}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
  }
}

export function PlayerStaffDisplay({ notes, clef = 'treble', beatsPerMeasure = 4 }: PlayerStaffDisplayProps) {
  const baseY = TOP_MARGIN + 8 * STEP_HEIGHT;
  const height = baseY + TOP_MARGIN;
  const clefConfig = CLEF_CONFIG[clef];

  const entries = useMemo(() => notes.map((entry) => ({ ...entry, beats: getDurationBeats(entry.duration, entry.dotted) })), [notes]);

  const totalBeats = entries.reduce((sum, entry) => sum + entry.beats, 0);
  const totalMeasures = Math.max(Math.ceil(totalBeats / beatsPerMeasure), 1);

  const beatX = (beatPosition: number) => LEFT_MARGIN + beatPosition * BEAT_WIDTH;
  const width = beatX(totalMeasures * beatsPerMeasure) + RIGHT_PADDING;

  const barlineBeats = useMemo(
    () => Array.from({ length: totalMeasures + 1 }, (_, m) => m * beatsPerMeasure),
    [totalMeasures, beatsPerMeasure],
  );

  const beatOffsets: number[] = [];
  entries.reduce((cumulative, entry) => {
    beatOffsets.push(cumulative);
    return cumulative + entry.beats;
  }, 0);

  const notePositions = entries.map((entry, index) => {
    const x = beatX(beatOffsets[index]) + NOTE_INSET;
    const parsed = entry.note ? parseNoteWithOctave(entry.note) : null;
    const step = entry.note ? getStaffStep(entry.note, clef) : 0;
    return { key: `note-${index}`, entry, x, step, parsed };
  });

  return (
    <div className="overflow-x-auto rounded-xl" style={{ background: '#18181B' }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {[0, 2, 4, 6, 8].map((step) => (
          <line
            key={`line-${step}`}
            x1={beatX(0)}
            y1={baseY - step * STEP_HEIGHT}
            x2={beatX(totalMeasures * beatsPerMeasure)}
            y2={baseY - step * STEP_HEIGHT}
            stroke={LINE_COLOR}
            strokeWidth={1}
          />
        ))}

        {barlineBeats.map((beatPosition) => (
          <line
            key={`barline-${beatPosition}`}
            x1={beatX(beatPosition)}
            y1={baseY - 8 * STEP_HEIGHT}
            x2={beatX(beatPosition)}
            y2={baseY}
            stroke={BARLINE_COLOR}
            strokeWidth={2}
          />
        ))}

        <text x={LEFT_MARGIN - 30} y={baseY - clefConfig.yOffsetSteps * STEP_HEIGHT} fontSize={clefConfig.fontSize} fill="#A1A1AA">
          {clefConfig.glyph}
        </text>

        {notePositions.map(({ key, entry, x, step, parsed }) => {
          if (!entry.note) {
            return <RestGlyph key={key} x={x} y={baseY - 4 * STEP_HEIGHT} duration={entry.duration} />;
          }

          const y = baseY - step * STEP_HEIGHT;
          const stemUp = step <= 4;
          const ledgers = getLedgerSteps(step);
          const accidentalSymbol = parsed && parsed.accidental !== 'natural' ? ACCIDENTAL_SYMBOL[parsed.accidental] : undefined;

          return (
            <Fragment key={key}>
              {ledgers.map((ledgerStep) => (
                <line
                  key={`${key}-ledger-${ledgerStep}`}
                  x1={x - 10}
                  y1={baseY - ledgerStep * STEP_HEIGHT}
                  x2={x + 10}
                  y2={baseY - ledgerStep * STEP_HEIGHT}
                  stroke={LINE_COLOR}
                  strokeWidth={1}
                />
              ))}
              {accidentalSymbol && (
                <text x={x - 14} y={y + 5} fontSize={14} fill={NOTE_COLOR} textAnchor="middle">
                  {accidentalSymbol}
                </text>
              )}
              <NoteStem x={x} y={y} duration={entry.duration} stemUp={stemUp} />
              <NoteHead x={x} y={y} duration={entry.duration} />
              <text x={x} y={y + 22} fontSize={9} fill={LINE_COLOR} textAnchor="middle">
                {entry.note}
              </text>
            </Fragment>
          );
        })}
      </svg>
    </div>
  );
}