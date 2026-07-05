import { useState } from 'react';
import { ArrowRight, Activity, Database } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface CorrPair {
  id: string;
  a: string;
  b: string;
  r: number;
  n: number;
}

const strengthLabel = (absR: number): string =>
  absR >= 0.7 ? 'Strong' : absR >= 0.4 ? 'Moderate' : 'Weak';

export function CorrelationsSection() {
  const result = useStore((s) => s.result!);

  // Real Pearson correlations computed by the engine (already filtered to n >= 15 paired days).
  const pairs: CorrPair[] = [...result.correlations]
    .sort((x, y) => Math.abs(y.r) - Math.abs(x.r))
    .map((c) => ({ id: `${c.a}__${c.b}`, a: c.a, b: c.b, r: c.r, n: c.n }));

  const [activeId, setActiveId] = useState<string>('');
  const active = pairs.find((p) => p.id === activeId) ?? pairs[0];

  const title = (
    <div>
      <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">Biometric Correlation Engine</h1>
      <p className="text-sm text-muted mt-1">
        Relationships computed directly from your health export. Correlation does not imply causation.
      </p>
    </div>
  );

  if (pairs.length === 0 || !active) {
    return (
      <div className="space-y-8">
        {title}
        <div className="card p-8 border border-line/40 bg-surface/30 flex flex-col items-center justify-center text-center min-h-[280px]">
          <Database size={32} className="text-muted/50 mb-4" />
          <h3 className="text-lg font-bold text-ink">Insufficient Telemetry</h3>
          <p className="text-xs text-muted mt-2 max-w-sm leading-relaxed">
            A reliable correlation needs at least 15 days where two metrics were recorded together. Keep
            logging steps, sleep, heart rate, and HRV, then check back.
          </p>
        </div>
      </div>
    );
  }

  const absR = Math.abs(active.r);
  const strength = strengthLabel(absR);
  const positive = active.r >= 0;
  const desc = positive
    ? `Over ${active.n} days, ${active.a} and ${active.b} moved together (r = ${active.r.toFixed(2)}, ${strength.toLowerCase()} correlation).`
    : `Over ${active.n} days, ${active.a} and ${active.b} moved in opposite directions (r = ${active.r.toFixed(2)}, ${strength.toLowerCase()} correlation).`;

  return (
    <div className="space-y-8">
      {title}

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: relationship menu */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs uppercase tracking-widest text-faint font-semibold block mb-3 px-1 border-b border-line/30 pb-2">
            Analyzed Relationships
          </span>
          {pairs.map((p) => {
            const pos = p.r >= 0;
            const on = p.id === active.id;
            return (
              <div
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`card p-4 border cursor-pointer transition-all rounded-2xl flex items-center justify-between gap-4 ${
                  on ? 'border-accent bg-accent/[0.03] scale-[1.01] shadow-lg' : 'border-line/60 bg-surface/30 hover:border-line'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-ink truncate">{p.a} ↔ {p.b}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos ? 'bg-good/10 text-good' : 'bg-bad/10 text-bad'}`}>
                      {pos ? 'Positive' : 'Inverse'}
                    </span>
                    <span className="font-medium tabular-nums">r = {pos ? '+' : ''}{p.r.toFixed(2)}</span>
                    <span className="text-[10px] text-faint ml-auto tabular-nums">n = {p.n}d</span>
                  </div>
                </div>
                <ArrowRight size={14} className={`shrink-0 ${on ? 'text-accent' : 'text-muted'}`} />
              </div>
            );
          })}
        </div>

        {/* Right: detail */}
        <div className="lg:col-span-7">
          <div className="card p-6 sm:p-8 border border-line/40 bg-surface/30 backdrop-blur-md shadow-card space-y-6 relative overflow-hidden">
            <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between pb-4 border-b border-line/40">
              <div>
                <span className="text-[10px] text-faint uppercase font-semibold">Active Relationship</span>
                <h2 className="font-grotesk text-xl font-bold text-ink mt-1">{active.a} vs {active.b}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-faint uppercase font-semibold block">Correlation (r)</span>
                <span className="text-3xl font-grotesk font-bold text-accent tabular-nums">{active.r.toFixed(2)}</span>
              </div>
            </div>

            {/* Relationship strength, derived from the real |r| */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-muted mb-2">
                <span className="flex items-center gap-1.5"><Activity size={12} className="text-accent" /> Relationship strength</span>
                <span className="font-bold text-ink">{strength}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-line/30 overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${absR * 100}%` }} />
              </div>
            </div>

            {/* Honest sample size (replaces the fabricated confidence interval) */}
            <div className="flex items-center gap-2 text-xs text-muted">
              <Database size={12} className="text-muted" />
              <span>Based on <b className="text-ink tabular-nums">{active.n}</b> paired days of data.</span>
            </div>

            {/* Non-causal, sign-aware description generated from the real values */}
            <div className="bg-surface-2/20 p-5 rounded-2xl border border-line/20 text-xs sm:text-sm">
              <p className="text-ink leading-relaxed">{desc}</p>
              <p className="text-muted leading-relaxed mt-2">
                This is an observed association in your own data, not a cause-and-effect relationship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
