import { Fragment, useState } from 'react';
import type { TabNoteEntry } from '../../../../types/lessonStep';
import { getDurationBeats, STANDARD_TUNING } from '../../../../core/musicTheory';
import { PLAYER_COLORS } from './playerTheme';

interface PlayerTabDisplayProps {
  notes: TabNoteEntry[];
  beatsPerMeasure?: number;
  interactive?: boolean;
  onCommitNote?: (index: number | null, string: number, fret: number) => void;
  onDeleteNote?: (index: number) => void;
}

const STRING_COUNT = 6;
const ROW_HEIGHT = 22;
const LEFT_MARGIN = 40;
const RIGHT_PADDING = 24;
const TOP_MARGIN = 20;
const NOTE_GAP = 44;
const NOTE_INSET = 24;
const MAX_FRET = 24;
const NOTE_BADGE_COLOR = '#232329';
const EDITOR_WIDTH = 30;
const EDITOR_HEIGHT = 22;

const STRING_LABELS = [...STANDARD_TUNING].reverse();

interface EditorState {
  index: number | null;
  string: number;
  x: number;
}

function rowY(stringNumber: number) {
  return TOP_MARGIN + (stringNumber - 1) * ROW_HEIGHT;
}

export function PlayerTabDisplay({ notes, beatsPerMeasure = 4, interactive = false, onCommitNote, onDeleteNote }: PlayerTabDisplayProps) {
  const [editing, setEditing] = useState<EditorState | null>(null);
  const [draft, setDraft] = useState('');

  const entries = notes.map((entry) => ({ ...entry, beats: getDurationBeats(entry.duration, entry.dotted) }));
  const totalBeats = entries.reduce((sum, entry) => sum + entry.beats, 0);
  const totalMeasures = Math.max(Math.ceil((totalBeats + 0.5) / beatsPerMeasure), 1);

  const beatX = (beatPosition: number) => LEFT_MARGIN + beatPosition * NOTE_GAP;
  const height = rowY(STRING_COUNT) + TOP_MARGIN;
  const width = beatX(totalMeasures * beatsPerMeasure) + RIGHT_PADDING;

  const barlineBeats = Array.from({ length: totalMeasures + 1 }, (_, m) => m * beatsPerMeasure);

  const beatOffsets: number[] = [];
  entries.reduce((cumulative, entry) => {
    beatOffsets.push(cumulative);
    return cumulative + entry.beats;
  }, 0);

  const notePositions = entries.map((entry, index) => ({
    key: `note-${index}`,
    entry,
    index,
    x: beatX(beatOffsets[index]) + NOTE_INSET,
  }));

  const appendX = notePositions.length > 0 ? notePositions[notePositions.length - 1].x + NOTE_GAP : beatX(0) + NOTE_INSET;

  function openEditor(index: number | null, stringNumber: number, x: number) {
    if (!interactive) return;
    const existing = index !== null ? notes[index] : undefined;
    setDraft(existing?.fret !== undefined ? String(existing.fret) : '');
    setEditing({ index, string: stringNumber, x });
  }

  function commitEditor() {
    if (!editing) return;
    const value = draft.trim();
    if (value === '') {
      if (editing.index !== null) onDeleteNote?.(editing.index);
    } else {
      const fret = Math.max(0, Math.min(MAX_FRET, parseInt(value, 10) || 0));
      onCommitNote?.(editing.index, editing.string, fret);
    }
    setEditing(null);
  }

  return (
    <div className="overflow-x-auto rounded-xl" style={{ background: PLAYER_COLORS.background }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {Array.from({ length: STRING_COUNT }, (_, i) => i + 1).map((stringNumber) => (
          <Fragment key={`string-${stringNumber}`}>
            <line x1={LEFT_MARGIN - 8} y1={rowY(stringNumber)} x2={width - 12} y2={rowY(stringNumber)} stroke={PLAYER_COLORS.line} strokeWidth={1} />
            <text x={12} y={rowY(stringNumber) + 4} fontSize={11} fill={PLAYER_COLORS.muted} fontFamily="monospace">
              {STRING_LABELS[stringNumber - 1]}
            </text>
          </Fragment>
        ))}

        {barlineBeats.map((beatPosition) => (
          <line
            key={`barline-${beatPosition}`}
            x1={beatX(beatPosition)}
            y1={rowY(1) - 10}
            x2={beatX(beatPosition)}
            y2={rowY(STRING_COUNT) + 10}
            stroke={PLAYER_COLORS.border}
            strokeWidth={2}
          />
        ))}

        {interactive && (
          <rect
            x={appendX - 15}
            y={rowY(1) - 12}
            width={30}
            height={rowY(STRING_COUNT) - rowY(1) + 24}
            rx={8}
            fill="none"
            stroke={PLAYER_COLORS.accent}
            strokeWidth={1.5}
            strokeDasharray="3,3"
            opacity={0.6}
          />
        )}

        {interactive &&
          Array.from({ length: STRING_COUNT }, (_, i) => i + 1).map((stringNumber) => (
            <rect
              key={`append-${stringNumber}`}
              x={appendX - 15}
              y={rowY(stringNumber) - 11}
              width={30}
              height={22}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => openEditor(null, stringNumber, appendX)}
            />
          ))}

        {notePositions.map(({ key, entry, index, x }) => {
          if (entry.string === undefined || entry.fret === undefined) {
            return (
              <text
                key={key}
                x={x}
                y={rowY(1) + (rowY(STRING_COUNT) - rowY(1)) / 2 + 4}
                fontSize={13}
                fill={PLAYER_COLORS.muted}
                textAnchor="middle"
              >
                𝄽
              </text>
            );
          }

          const y = rowY(entry.string);
          return (
            <Fragment key={key}>
              <rect x={x - 12} y={y - 9} width={24} height={18} rx={5} fill={NOTE_BADGE_COLOR} />
              <text x={x} y={y + 4} fontSize={12} fontWeight={700} fill={PLAYER_COLORS.accent} textAnchor="middle" fontFamily="monospace">
                {entry.fret}
              </text>
              {interactive && (
                <rect
                  x={x - 15}
                  y={y - 11}
                  width={30}
                  height={22}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openEditor(index, entry.string as number, x)}
                />
              )}
              {entry.dotted && <circle cx={x + 15} cy={y - 8} r={1.6} fill={PLAYER_COLORS.accent} />}
            </Fragment>
          );
        })}

        {editing && (
          <foreignObject
            x={editing.x - EDITOR_WIDTH / 2}
            y={rowY(editing.string) - EDITOR_HEIGHT / 2}
            width={EDITOR_WIDTH}
            height={EDITOR_HEIGHT}
          >
            <input
              autoFocus
              type="tel"
              maxLength={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitEditor();
                if (event.key === 'Escape') setEditing(null);
              }}
              onBlur={commitEditor}
              className="w-full h-full text-center rounded-md border-2 border-white font-mono text-sm font-bold outline-none"
              style={{ background: PLAYER_COLORS.accent, color: PLAYER_COLORS.background }}
            />
          </foreignObject>
        )}
      </svg>
    </div>
  );
}
