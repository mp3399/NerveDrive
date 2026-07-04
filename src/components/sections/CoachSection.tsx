import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ShieldCheck, ChevronDown, CheckCircle2, Zap, Target } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { buildRecommendations } from '../../lib/recommendations';

export function CoachSection() {
  const r = useStore((s) => s.result!);
  const recos = buildRecommendations(r);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const impactStatus = (i: string) => (i === 'Very high' ? 'bg-bad/10 text-bad border-bad/20' : i === 'High' ? 'bg-warn/10 text-warn border-warn/20' : 'bg-surface-2 text-muted border-line');

  const milestones = [
    {
      id: 'circadian',
      title: 'Circadian Peak Achievement',
      desc: 'Bedtime variance has remained under 18 minutes for 5 consecutive nights.',
      reward: '+4% Recovery Index baseline projection',
      icon: Award,
      color: 'good',
      details: {
        phase: 'Peak Cognitive Window',
        sleepPressure: 'Low (Ideal for focus)',
        chronotype: 'Early Riser (Lark)',
        melatonin: 'Curve optimized (starts 9:30 PM)',
      },
      stats: [
        { label: 'Consistency', val: '94%' },
        { label: 'Jet Lag', val: '0d' },
      ],
    },
    {
      id: 'aerobic',
      title: 'Aerobic Threshold Breakout',
      desc: 'Active energy expenditure reached an all-time monthly high on June 28.',
      reward: 'Lowered baseline RHR projection',
      icon: Target,
      color: 'accent',
      details: {
        vo2: 'Improving (Correlation strong)',
        zone: '80% Zone 2 / 20% Zone 4',
        lactate: 'Efficiency increasing',
        recovery: 'HR drops 30bpm in 1min',
      },
      stats: [
        { label: 'Adaptation', val: 'High' },
        { label: 'Trend', val: '+12%' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">AI Coach Center</h1>
        <p className="text-sm text-muted mt-1">Personalized physiological recommendations ranked by return on investment (ROI). Follow from the top.</p>
      </div>

      {/* Milestones / Achievements */}
      <div className="grid gap-6 lg:grid-cols-2">
        {milestones.map((ms) => (
          <div key={ms.id} className="card group relative overflow-hidden bg-surface/30 border border-white/5 p-6 sm:p-8 hover:border-line transition-all">
            {/* Ambient Background */}
            <div className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${ms.color === 'good' ? 'bg-good' : 'bg-accent'}`} />
            
            <div className="flex items-start gap-4">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl border shrink-0 ${ms.color === 'good' ? 'bg-good/10 text-good border-good/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
                <ms.icon size={24} strokeWidth={1.5} />
              </span>
              <div>
                <h4 className="font-grotesk text-xl font-bold text-ink">{ms.title}</h4>
                <p className="text-sm text-muted mt-1.5 leading-relaxed max-w-md">{ms.desc}</p>
                <div className="text-xs font-semibold text-ink mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 rounded-lg w-max border border-line/30">
                  <CheckCircle2 size={14} className={ms.color === 'good' ? 'text-good' : 'text-accent'} /> {ms.reward}
                </div>
              </div>
            </div>

            {/* Expansive Details on Hover (Desktop) / Default visible (Mobile) */}
            <div className="mt-6 pt-6 border-t border-line/40 grid grid-cols-2 gap-x-6 gap-y-4 opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-faint font-semibold">Deep Metrics</span>
                <ul className="space-y-2 text-xs text-muted">
                  {Object.entries(ms.details).map(([k, v]) => (
                    <li key={k} className="flex justify-between items-center gap-4">
                      <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-ink font-medium text-right">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-faint font-semibold">Historical Trend</span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {ms.stats.map((stat) => (
                    <div key={stat.label} className="bg-surface-2/50 border border-line/20 rounded-xl p-2.5">
                      <div className="text-lg font-bold text-ink font-grotesk">{stat.val}</div>
                      <div className="text-[9px] uppercase text-muted mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-faint font-semibold block mb-2 px-1">Top Interventions</span>
        {recos.map((rec, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <div
              key={i}
              className="card border border-white/5 bg-surface/30 hover:border-accent/40 transition-colors rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
            >
              <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="stat-num w-6 shrink-0 text-xl font-bold font-grotesk text-faint mt-0.5">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-ink">{rec.title}</h3>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-md ${impactStatus(rec.impact)}`}>
                        {rec.impact} Impact
                      </span>
                      <span className="text-xs text-muted">· {rec.effort} effort</span>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">{rec.why.slice(0, 100)}...</p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent' : ''}`}
                />
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-line/30 bg-surface-2/10"
                  >
                    <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm leading-relaxed">
                      <div>
                        <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold">Primary Rationale</span>
                        <p className="mt-1 text-ink">{rec.why}</p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold">Implementation Instructions</span>
                          <p className="mt-1 text-xs text-muted leading-relaxed">
                            Start with small iterations. Integrate this habit daily for at least 14 consecutive days. Consistency holds greater impact than intensity.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-accent">
                            <Target size={14} className="shrink-0" />
                            <span className="text-xs font-semibold">Target area: Sleep Consistency & recovery indexes</span>
                          </div>
                          <div className="flex items-center gap-2 text-accent">
                            <Zap size={14} className="shrink-0" />
                            <span className="text-xs font-semibold">Expected results: 5-8% increase in HRV average</span>
                          </div>
                        </div>
                      </div>
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
        <span>Coach recommendations are customized dynamically. Fixing the top rank yields compounding advantages for downstream biological systems.</span>
      </div>
    </div>
  );
}
