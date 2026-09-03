import { useMemo } from 'react';
import { getHarmonicField } from '../../../core/musicTheory';

const FUNCTION_COLORS: Record<string, string> = {
  major: '#00D9FF',
  minor: '#A855F7',
  dim: '#F59E0B',
};

interface PlayerHarmonicFieldProps {
  size?: number;
  rootKey: string;
  mode: 'major' | 'minor';
  selectedDegrees: string[];
  onToggleDegree?: (degree: string) => void;
}

export function PlayerHarmonicField({ size = 240, rootKey, mode, selectedDegrees, onToggleDegree }: PlayerHarmonicFieldProps) {
  const center = size / 2;
  const radius = size / 2 - 32;

  const harmonicField = useMemo(() => getHarmonicField(rootKey, mode), [rootKey, mode]);

  const chordPositions = useMemo(
    () =>
      harmonicField.map((chord, i) => {
        const angle = (i * (360 / harmonicField.length) - 90) * (Math.PI / 180);
        return { chord, x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
      }),
    [harmonicField, center, radius],
  );

  const interactive = !!onToggleDegree;

  return (
    <svg width={size} height={size}>
      {chordPositions.map(({ chord, x, y }) => {
        const isSelected = selectedDegrees.includes(chord.degree);
        const fill = isSelected ? '#00D9FF' : FUNCTION_COLORS[chord.quality] ?? '#27272A';
        const stroke = isSelected ? '#00D9FF' : fill;
        const text = '#09090B';
        return (
          <g
            key={chord.degree}
            style={interactive ? { cursor: 'pointer' } : undefined}
            onClick={interactive ? () => onToggleDegree?.(chord.degree) : undefined}
          >
            <circle cx={x} cy={y} r={24} fill={fill} stroke={stroke} strokeWidth={2} />
            <text x={x} y={y - 2} fontSize={11} fontWeight="bold" fill={text} textAnchor="middle">
              {chord.degree}
            </text>
            <text x={x} y={y + 12} fontSize={10} fill={text} textAnchor="middle">
              {chord.root}
            </text>
          </g>
        );
      })}
    </svg>
  );
}