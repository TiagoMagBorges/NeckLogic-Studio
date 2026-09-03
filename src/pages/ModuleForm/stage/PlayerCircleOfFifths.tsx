import { useMemo } from 'react';
import { CIRCLE_OF_FIFTHS } from '../../../core/musicTheory';

interface PlayerCircleOfFifthsProps {
  size?: number;
  selectedKeys: string[];
  onToggleKey?: (note: string) => void;
}

export function PlayerCircleOfFifths({ size = 240, selectedKeys, onToggleKey }: PlayerCircleOfFifthsProps) {
  const center = size / 2;
  const radius = size / 2 - 28;

  const keyPositions = useMemo(
    () =>
      CIRCLE_OF_FIFTHS.map((note, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        return { note, x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
      }),
    [center, radius],
  );

  const interactive = !!onToggleKey;

  return (
    <svg width={size} height={size}>
      {keyPositions.map(({ note, x, y }) => {
        const isSelected = selectedKeys.includes(note);
        const fill = isSelected ? '#00D9FF' : '#18181B';
        const stroke = isSelected ? '#00D9FF' : '#3F3F46';
        const text = isSelected ? '#09090B' : '#FFFFFF';
        return (
          <g
            key={note}
            style={interactive ? { cursor: 'pointer' } : undefined}
            onClick={interactive ? () => onToggleKey?.(note) : undefined}
          >
            <circle cx={x} cy={y} r={19} fill={fill} stroke={stroke} strokeWidth={2} />
            <text x={x} y={y + 5} fontSize={14} fontWeight="bold" fill={text} textAnchor="middle">
              {note}
            </text>
          </g>
        );
      })}
    </svg>
  );
}