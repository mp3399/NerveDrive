import { useMemo } from 'react';

/**
 * Minimal inline-SVG sparkline. Trust rule: renders NOTHING unless there are at least two
 * real (non-null) data points. Never synthesizes a curve from a mean or a single reading, so an
 * empty or near-empty series shows no line rather than a fabricated trend.
 */
export function Sparkline({
  values,
  width = 64,
  height = 20,
  color = 'currentColor',
  className = '',
  strokeWidth = 1.5,
}: {
  values: (number | null | undefined)[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}) {
  const path = useMemo(() => {
    const pts = (values ?? []).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    if (pts.length < 2) return null;
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const span = max - min || 1;
    const stepX = width / (pts.length - 1);
    const pad = strokeWidth; // keep the stroke inside the box
    const h = height - pad * 2;
    return pts
      .map((v, i) => {
        const x = i * stepX;
        const y = pad + h - ((v - min) / span) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [values, width, height, strokeWidth]);

  if (!path) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path d={path} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
