import { DotMatrixNumber } from './DotMatrixNumber';

/** Hero score card with the green→amber gradient and dot-matrix number. */
export function ScoreGauge({ score, label }: { score: number; label: string }) {
  const verdict = score >= 70 ? 'On Track' : score >= 45 ? 'Needs Work' : 'At Risk';
  return (
    <div className="relative overflow-hidden rounded-3xl border p-6 sm:p-8" style={{ minHeight: 220 }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 120%, rgb(var(--good)) 0%, rgb(var(--good)/0.55) 30%, rgb(var(--warn)/0.5) 62%, transparent 88%)',
        }}
        aria-hidden
      />
      <div className="relative flex h-full flex-col items-center justify-center text-center">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-ink/70">{label}</div>
        <div className="my-3 text-ink">
          <DotMatrixNumber value={Math.round(score)} size={13} gap={4} />
        </div>
        <div className="text-sm font-semibold text-ink/90">{verdict}</div>
      </div>
    </div>
  );
}
