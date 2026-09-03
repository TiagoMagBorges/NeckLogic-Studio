import { Fragment } from 'react';

export interface FretboardNote {
  string: number;
  fret: number;
  label?: string;
  color?: string;
}

interface PlayerFretboardProps {
  frets?: number;
  notes?: FretboardNote[];
  onCellClick?: (stringNumber: number, fret: number) => void;
}

const STRING_COUNT = 6;
const FRET_WIDTH = 75;
const SVG_HEIGHT = 260;
const NUT_OFFSET = 50;
const FRET_TOP = 20;
const FRET_BOTTOM = SVG_HEIGHT - 40;
const MARKER_RADIUS = 14;
const FONT_SIZE = 14;

const BG_COLOR = '#18181B';
const INLAY_COLOR = '#3F3F46';
const NUT_COLOR = '#D4D4D8';
const FRET_LINE_COLOR = '#52525B';
const STRING_COLOR = '#A1A1AA';
const FRET_NUMBER_COLOR = '#71717A';
const NOTE_TEXT_COLOR = '#09090B';
const DEFAULT_NOTE_COLOR = '#00D9FF';

const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];
const MARKED_FRETS = [0, ...SINGLE_INLAYS, ...DOUBLE_INLAYS];

export function PlayerFretboard({ frets = 22, notes = [], onCellClick }: PlayerFretboardProps) {
  const svgWidth = frets * FRET_WIDTH + NUT_OFFSET;
  const availableHeight = FRET_BOTTOM - FRET_TOP;
  const stringSpacing = availableHeight / (STRING_COUNT - 1);

  const fretsArray = Array.from({ length: frets + 1 }, (_, i) => i);
  const stringsArray = Array.from({ length: STRING_COUNT }, (_, i) => i);
  const interactive = !!onCellClick;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`} width={svgWidth} height={SVG_HEIGHT} style={{ display: 'block' }}>
        <rect x={0} y={0} width={svgWidth} height={SVG_HEIGHT} fill={BG_COLOR} />

        {SINGLE_INLAYS.map((fret) => {
          if (fret > frets) return null;
          const cx = fret * FRET_WIDTH - FRET_WIDTH / 2 + NUT_OFFSET;
          const cy = FRET_TOP + availableHeight / 2;
          return <circle key={`inlay-${fret}`} cx={cx} cy={cy} r={12} fill={INLAY_COLOR} />;
        })}

        {DOUBLE_INLAYS.map((fret) => {
          if (fret > frets) return null;
          const cx = fret * FRET_WIDTH - FRET_WIDTH / 2 + NUT_OFFSET;
          const cyCenter = FRET_TOP + availableHeight / 2;
          return (
            <Fragment key={`double-inlay-${fret}`}>
              <circle cx={cx} cy={cyCenter - 40} r={10} fill={INLAY_COLOR} />
              <circle cx={cx} cy={cyCenter + 40} r={10} fill={INLAY_COLOR} />
            </Fragment>
          );
        })}

        {fretsArray.map((i) => {
          const x = i * FRET_WIDTH + NUT_OFFSET;
          const isNut = i === 0;
          return (
            <line
              key={`fret-${i}`}
              x1={x}
              y1={FRET_TOP}
              x2={x}
              y2={FRET_BOTTOM}
              stroke={isNut ? NUT_COLOR : FRET_LINE_COLOR}
              strokeWidth={isNut ? 6 : 3}
            />
          );
        })}

        {stringsArray.map((i) => {
          const y = FRET_TOP + i * stringSpacing;
          const thickness = 1.5 + i * 0.7;
          return (
            <line key={`string-${i}`} x1={0} y1={y} x2={svgWidth} y2={y} stroke={STRING_COLOR} strokeWidth={thickness} />
          );
        })}

        {MARKED_FRETS.map((fret) => {
          if (fret > frets) return null;
          const x = fret === 0 ? NUT_OFFSET / 2 : fret * FRET_WIDTH - FRET_WIDTH / 2 + NUT_OFFSET;
          return (
            <text
              key={`fret-text-${fret}`}
              x={x}
              y={SVG_HEIGHT - 20}
              fill={FRET_NUMBER_COLOR}
              fontSize={14}
              fontWeight="bold"
              textAnchor="middle"
            >
              {fret}
            </text>
          );
        })}

        {notes.map((note, index) => {
          const cx = note.fret === 0 ? NUT_OFFSET / 2 : note.fret * FRET_WIDTH - FRET_WIDTH / 2 + NUT_OFFSET;
          const cy = FRET_TOP + (note.string - 1) * stringSpacing;
          const markerColor = note.color ?? DEFAULT_NOTE_COLOR;
          return (
            <Fragment key={`note-${index}-${note.string}-${note.fret}`}>
              <circle cx={cx} cy={cy} r={MARKER_RADIUS} fill={markerColor} />
              {note.label && (
                <text x={cx} y={cy + 5} fill={NOTE_TEXT_COLOR} fontSize={FONT_SIZE} fontWeight="bold" textAnchor="middle">
                  {note.label}
                </text>
              )}
            </Fragment>
          );
        })}

        {interactive &&
          stringsArray.map((stringIndex) =>
            fretsArray.map((fretIndex) => {
              const stringNumber = stringIndex + 1;
              const rectWidth = fretIndex === 0 ? NUT_OFFSET : FRET_WIDTH;
              const rectX = fretIndex === 0 ? 0 : NUT_OFFSET + (fretIndex - 1) * FRET_WIDTH;
              const rectY = FRET_TOP + stringIndex * stringSpacing - stringSpacing / 2;
              return (
                <rect
                  key={`touch-${stringNumber}-${fretIndex}`}
                  x={rectX}
                  y={rectY}
                  width={rectWidth}
                  height={stringSpacing}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onCellClick?.(stringNumber, fretIndex)}
                />
              );
            }),
          )}
      </svg>
    </div>
  );
}