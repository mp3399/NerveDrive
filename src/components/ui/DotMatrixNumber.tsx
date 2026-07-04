/**
 * The signature dot-matrix numeral (LED motif from the design language).
 * Renders digits as a 3x5 dot grid in SVG. Falls back gracefully for '.', '-', ' '.
 */
const GLYPHS: Record<string, number[]> = {
  '0': [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
  '1': [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1],
  '2': [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  '3': [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  '4': [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
  '5': [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  '6': [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  '8': [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  '.': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  '-': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
};

export function DotMatrixNumber({
  value,
  size = 10,
  gap = 3,
  color = 'currentColor',
  className = '',
}: {
  value: string | number;
  size?: number;
  gap?: number;
  color?: string;
  className?: string;
}) {
  const chars = String(value).split('');
  const dot = size;
  const cell = dot + gap;
  const digitW = 3 * cell - gap;
  const digitH = 5 * cell - gap;
  const spacing = cell;
  let x = 0;
  const positions: { cx: number; cy: number; on: boolean }[] = [];
  for (const ch of chars) {
    const g = GLYPHS[ch];
    if (!g) {
      x += digitW * 0.5 + spacing;
      continue;
    }
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 3; c++)
        positions.push({ cx: x + c * cell + dot / 2, cy: r * cell + dot / 2, on: !!g[r * 3 + c] });
    x += digitW + spacing;
  }
  const totalW = Math.max(x - spacing, digitW);
  return (
    <svg
      className={className}
      width={totalW}
      height={digitH}
      viewBox={`0 0 ${totalW} ${digitH}`}
      role="img"
      aria-label={String(value)}
    >
      {positions.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={dot / 2} fill={color} opacity={p.on ? 1 : 0.12} />
      ))}
    </svg>
  );
}
