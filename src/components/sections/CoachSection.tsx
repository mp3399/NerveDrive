import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ShieldCheck, ChevronDown, TrendingUp, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { buildRecommendations } from '../../lib/recommendations';
import { n0, n1 } from '../../lib/format';
import { Sparkline } from '../ui/Sparkline';

interface Achievement {
  id: string;
  icon: LucideIcon;
  title: string;
  value: string;
  desc: string;
  tone: 'good' | 'accent';
  sparkKey?: string; // r.series key for a real trend line; omitted when there is no series
}

export function CoachSection() {
  const r = useStore((s) => s.result!);
  const { cardio: c, activity: a } = r;
  const recos = buildRecommendations(r);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const impactStatus = (i: string) =>
    i === 'Very high' ? 'bg-bad/10 text-bad border-bad/20' : i === 'High' ? 'bg-warn/10 text-warn border-warn/20' : 'bg-surface-2 text-muted border-line';

  // Real, positive-only achievements. Each is rendered only when the underlying data qualifies.
  const trend = (first: number, last: number, betterIsHigher: boolean) => {
    if (!Number.isFinite(first) || !Number.isFinite(last) || first === last) return null;
    const delta = last - first;
    return { delta, improved: betterIsHigher ? delta > 0 : delta < 0 };
  };

  const pillars = ['Activity', 'Cardio Fitness', 'Recovery', 'Sleep', 'Consistency', 'Stress Resilience', 'Mobility'];
  const topScore = pillars
    .map((k) => ({ k, v: r.scores[k] }))
    .filter((e) => Number.isFinite(e.v))
    .sort((x, y) => y.v - x.v)[0];

  const achievements: Achievement[] = [];
  if (a.longest10kStreak > 0)
    achievements.push({ id: 'streak', icon: Activity, title: 'Longest 10k step streak', value: `${a.longest10kStreak}d`, desc: 'Consecutive days at or above 10,000 steps.', tone: 'good' });
  if (a.stepsMax > 0 && a.stepsMaxDate)
    achievements.push({ id: 'best', icon: Award, title: 'Most active day', value: n0(a.stepsMax), desc: `Your step record, set on ${a.stepsMaxDate}.`, tone: 'accent' });
  if (topScore)
    achievements.push({ id: 'top', icon: ShieldCheck, title: `Strongest system: ${topScore.k}`, value: `${topScore.v}/100`, desc: 'Your highest-scoring health pillar.', tone: 'good' });
  const vo2t = trend(c.vo2First, c.vo2Latest, true);
  if (vo2t?.improved)
    achievements.push({ id: 'vo2', icon: TrendingUp, title: 'VO₂ Max improving', value: `+${n1(vo2t.delta)}`, desc: 'ml/kg/min gained across your recorded window.', tone: 'good', sparkKey: 'vo2' });
  const rhrt = trend(c.restingHrFirst, c.restingHrLast, false);
  if (rhrt?.improved)
    achievements.push({ id: 'rhr', icon: TrendingUp, title: 'Resting HR trending down', value: `-${n0(-rhrt.delta)} bpm`, desc: 'Lower resting heart rate across your window.', tone: 'good', sparkKey: 'restingHr' });
  const hrvt = trend(c.hrvFirst, c.hrvLast, true);
  if (hrvt?.improved)
    achievements.push({ id: 'hrv', icon: TrendingUp, title: 'HRV trending up', value: `+${n0(hrvt.delta)} ms`, desc: 'Higher heart rate variability across your window.', tone: 'good', sparkKey: 'hrv' });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">AI Coach Center</h1>
        <p className="text-sm text-muted mt-1">Personalized recommendations ranked by expected return, plus real milestones from your data. Follow from the top.</p>
      </div>

      {/* Real milestones (only what the data supports) */}
      {achievements.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((ms) => (
            <div key={ms.id} className="card relative overflow-hidden bg-surface/30 border border-line/50 p-5 hover:border-line transition-colors">
              <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20 ${ms.tone === 'good' ? 'bg-good' : 'bg-accent'}`} />
              <span className={`grid h-11 w-11 place-items-center rounded-2xl border shrink-0 ${ms.tone === 'good' ? 'bg-good/10 text-good border-good/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
                <ms.icon size={22} strokeWidth={1.5} />
              </span>
              <div className="mt-4">
                <div className="text-2xl font-bold font-grotesk text-ink tabular-nums">{ms.value}</div>
                <h4 className="font-semibold text-sm text-ink mt-1">{ms.title}</h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">{ms.desc}</p>
                {ms.sparkKey && (
                  <Sparkline
                    values={r.series[ms.sparkKey]?.values}
                    color={ms.tone === 'good' ? 'rgb(var(--good))' : 'rgb(var(--accent))'}
                    className="mt-3 w-full h-5 opacity-70"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-6 border border-line/40 bg-surface/30 flex items-center gap-3 text-xs text-muted">
          <ShieldCheck size={16} className="text-muted shrink-0" />
          <span>Not enough history yet for milestones. As streaks build and trends emerge across your window, achievements will appear here.</span>
        </div>
      )}

      {/* Recommendations feed (already data-driven via buildRecommendations) */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-faint font-semibold block mb-2 px-1">Top Interventions</span>
        {recos.map((rec, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <div
              key={i}
              className="card border border-line/50 bg-surface/30 hover:border-accent/40 transition-colors rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
            >
              <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <span className="stat-num w-6 shrink-0 text-xl font-bold font-grotesk text-faint mt-0.5">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-ink">{rec.title}</h3>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-md ${impactStatus(rec.impact)}`}>{rec.impact} Impact</span>
                      <span className="text-xs text-muted">· {rec.effort} effort</span>
                    </div>
                    {!isExpanded && <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">{rec.why}</p>}
                  </div>
                </div>
                <ChevronDown size={16} className={`shrink-0 text-muted mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent' : ''}`} />
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-line/30 bg-surface-2/10"
                  >
                    <div className="p-4 sm:p-5 text-xs sm:text-sm leading-relaxed">
                      <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold">Why this matters for you</span>
                      <p className="mt-1 text-ink">{rec.why}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 bg-surface-2/20 border border-line/20 p-4 rounded-2xl text-xs text-muted">
        <ShieldCheck size={16} className="text-accent shrink-0" />
        <span>Recommendations are generated from your own data and re-rank as it changes. Start at the top for the largest expected benefit.</span>
      </div>
    </div>
  );
}
