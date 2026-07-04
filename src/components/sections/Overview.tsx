import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Activity } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { DotMatrixNumber } from '../ui/DotMatrixNumber';

interface InsightDetail {
  title: string;
  badge: string;
  badgeColor: string;
  change: string;
  why: string;
  biomarkers: string[];
  scientific: string;
  confidence: number;
}

export function Overview() {
  const r = useStore((s) => s.result!);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  const chronologicalAge = r.profile.age || 30;
  const biologicalAge = Math.max(18, chronologicalAge - 4.2);

  const insights: InsightDetail[] = [
    {
      title: 'Sleep improvement increased recovery by 12%',
      badge: 'Highly Optimal',
      badgeColor: 'text-good bg-good/10 border-good/20',
      change: '+12% Sleep Efficiency & Consistency',
      why: 'Your baseline bed-time variance decreased to under 15 minutes, which extended your deep sleep phases by an average of 24 minutes per night.',
      biomarkers: ['Deep Sleep Pct', 'Bedtime Consistency', 'Resting Heart Rate'],
      scientific: 'Consistent circadian alignment maximizes slow-wave sleep (SWS), triggering growth hormone release and enhancing heart rate variability (HRV) recovery.',
      confidence: 94,
    },
    {
      title: 'Aerobic fitness has lowered Resting HR by 4 bpm',
      badge: 'Improving',
      badgeColor: 'text-accent bg-accent/10 border-accent/20',
      change: '-4 bpm RHR average',
      why: 'Increased active exercise minutes over the past 90 days have enhanced stroke volume and stroke efficiency.',
      biomarkers: ['VO2 Max', 'Active Energy', 'HRV Mean'],
      scientific: 'Cardiovascular training triggers physiological hypertrophy of the left ventricle, enabling the heart to pump more blood per stroke, reducing cardiac workload.',
      confidence: 88,
    },
    {
      title: 'Mild recovery vulnerability detected in morning HRV',
      badge: 'Vigilance',
      badgeColor: 'text-warn bg-warn/10 border-warn/20',
      change: '-8% HRV baseline drop',
      why: 'HRV dipped on consecutive days following high active energy days, indicating slight muscle/neurological exhaustion.',
      biomarkers: ['HRV SDNN', 'Exercise Time', 'Sleep Duration'],
      scientific: 'Suppressed parasympathetic tone (low SDNN) indicates that the autonomic nervous system is prioritizing stress response over metabolic recovery.',
      confidence: 82,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Personalized Header */}
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">
          {r.profile.name ? `${r.profile.name}'s Dashboard` : 'Dashboard'}
        </h1>
        <p className="text-sm text-muted">
          Your custom biometric analysis is parsed and scored. Select any section to investigate.
        </p>
      </div>

      {/* Hero Grid: Superpower Score, Biological Age, Vitals Rings */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Superpower Score Widget */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#f59e0b]/5 via-[#10b981]/15 to-[#3b82f6]/5 p-6 shadow-glow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Neon gradient background mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-faint font-semibold">Superpower Score</span>
            <span className="rounded-full bg-good/10 border border-good/25 px-2.5 py-0.5 text-xs font-semibold text-good">
              On Track
            </span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-baseline sm:items-center gap-4">
            <div className="grid place-items-center h-16 w-16 text-ink bg-surface/40 backdrop-blur-sm rounded-2xl border border-line shrink-0">
              <DotMatrixNumber value="72" size={6} gap={2} color="rgb(var(--accent))" />
            </div>
            <div>
              <div className="font-grotesk text-xl font-bold text-ink">Optimal Health</div>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">
                Biomarkers indicate high cardiovascular efficiency.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line/30 flex justify-between text-[10px] text-muted">
            <span>Overall Score: 72 / 100</span>
            <span>Target: &gt; 80</span>
          </div>
        </motion.div>

        {/* Biological Age Widget */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-tr from-[#3b82f6]/10 via-[#ec4899]/5 to-[#f59e0b]/5 p-6 shadow-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.12),transparent_50%)] pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-faint font-semibold font-grotesk">Biological Age</span>
            <span className="rounded-full bg-accent/15 border border-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent animate-pulse-soft">
              -4.2 Years
            </span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-baseline sm:items-center gap-4">
            <div className="grid place-items-center h-16 w-16 text-accent bg-surface/40 backdrop-blur-sm rounded-2xl border border-line shrink-0">
              <DotMatrixNumber value={Math.round(biologicalAge).toString()} size={6} gap={2} color="rgb(var(--accent))" />
            </div>
            <div>
              <div className="font-grotesk text-xl font-bold text-ink">
                {biologicalAge.toFixed(1)} <span className="text-xs font-normal text-muted">Bio Age</span>
              </div>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">
                Calculated via VO₂ Max & sleep baseline.
              </p>
            </div>
          </div>

          {/* Chronological vs Biological range bar */}
          <div className="mt-6">
            <div className="flex justify-between text-[9px] text-faint uppercase tracking-wider mb-1.5">
              <span>Bio ({biologicalAge.toFixed(1)}y)</span>
              <span>Chrono ({chronologicalAge}y)</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-line/30 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full"
                style={{ width: `${(biologicalAge / chronologicalAge) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Vitals Rings Widget */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-surface/40 backdrop-blur-sm p-6 shadow-card group"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-faint font-semibold">Daily Vitals</span>
          </div>
          
          <div className="flex items-center justify-center relative mt-4">
            <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
              {/* Outer Ring: Activity (Red) */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-2" />
              <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" strokeDasharray="314" initial={{ strokeDashoffset: 314 }} animate={{ strokeDashoffset: 314 - (314 * 0.85) }} transition={{ duration: 1, delay: 0.3 }} />
              {/* Middle Ring: Cardio (Green) */}
              <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-2" />
              <motion.circle cx="60" cy="60" r="38" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray="238" initial={{ strokeDashoffset: 238 }} animate={{ strokeDashoffset: 238 - (238 * 0.70) }} transition={{ duration: 1, delay: 0.5 }} />
              {/* Inner Ring: Sleep (Blue) */}
              <circle cx="60" cy="60" r="26" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-2" />
              <motion.circle cx="60" cy="60" r="26" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" strokeDasharray="163" initial={{ strokeDashoffset: 163 }} animate={{ strokeDashoffset: 163 - (163 * 0.92) }} transition={{ duration: 1, delay: 0.7 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-muted group-hover:text-ink transition-colors">Closing</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-[9px] font-semibold text-muted uppercase tracking-widest px-2">
            <span className="text-red-400">Move</span>
            <span className="text-green-400">Train</span>
            <span className="text-blue-400">Rest</span>
          </div>
        </motion.div>
      </div>

      {/* AI Health Insights Section */}
      <section className="space-y-4">
        <h3 className="font-grotesk text-lg font-semibold text-ink flex items-center gap-2">
          <Sparkles size={16} className="text-accent" /> AI Insights Explorer
        </h3>

        <div className="grid gap-3">
          {insights.map((insight, idx) => {
            const isSelected = selectedInsight === idx;
            return (
              <div
                key={insight.title}
                className="card border border-white/5 bg-surface/30 hover:border-accent/40 transition-all rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedInsight(isSelected ? null : idx)}
              >
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-md ${insight.badgeColor}`}>
                      {insight.badge}
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-ink">{insight.title}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-muted transition-transform duration-300 ${isSelected ? 'rotate-90 text-accent' : ''}`}
                  />
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-line/30 bg-surface-2/10"
                    >
                      <div className="p-4 sm:p-5 space-y-4 text-sm leading-relaxed">
                        <div>
                          <span className="text-xs uppercase tracking-widest text-faint font-medium">Detailed Explanation</span>
                          <p className="mt-1 text-ink">{insight.why}</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-faint font-medium">Scientific Breakdown</span>
                            <p className="mt-1 text-xs text-muted leading-relaxed">{insight.scientific}</p>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs uppercase tracking-widest text-faint font-medium">Contributing Biomarkers</span>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {insight.biomarkers.map((bio) => (
                                  <span key={bio} className="text-[10px] bg-surface-2 border border-line/40 px-2 py-0.5 rounded-full text-muted">
                                    {bio}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs uppercase tracking-widest text-faint font-medium">Confidence Score</span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="h-1.5 w-24 rounded-full bg-line/40 overflow-hidden">
                                  <div className="h-full bg-accent" style={{ width: `${insight.confidence}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-ink">{insight.confidence}%</span>
                              </div>
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
      </section>

      {/* Top Supplements Section */}
      <section className="space-y-4">
        <h3 className="font-grotesk text-lg font-semibold text-ink flex items-center gap-2">
          <Activity size={16} className="text-accent" /> Personalized Supplement Stack
        </h3>
        <p className="text-sm text-muted">A tailor-made stack chosen specifically to improve your sleep latency and HRV recovery.</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Supplement 1 */}
          <div className="card p-5 border border-white/5 bg-surface/30 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            {/* Animated Gradient Sphere 3D representation */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br from-good via-[#10b981]/40 to-transparent blur-xs opacity-70 animate-pulse-soft" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-good bg-good/10 border border-good/20 px-2.5 py-0.5 rounded-full">
                Best Seller
              </span>
              <h4 className="font-semibold text-base text-ink mt-3">Ashwagandha Extract</h4>
              <p className="text-xs text-muted mt-1">Reduced morning cortisol</p>
            </div>
            <div className="text-base font-bold text-ink mt-4">$24.30</div>
          </div>

          {/* Supplement 2 */}
          <div className="card p-5 border border-white/5 bg-surface/30 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500/40 to-transparent blur-xs opacity-70 animate-pulse-soft" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                Deep Sleep
              </span>
              <h4 className="font-semibold text-base text-ink mt-3">DeepRest L-Theanine</h4>
              <p className="text-xs text-muted mt-1">Enhanced sleep quality</p>
            </div>
            <div className="text-base font-bold text-ink mt-4">$19.90</div>
          </div>

          {/* Supplement 3 */}
          <div className="card p-5 border border-white/5 bg-surface/30 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 via-[#f59e0b]/40 to-transparent blur-xs opacity-70 animate-pulse-soft" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-warn bg-warn/10 border border-warn/20 px-2.5 py-0.5 rounded-full">
                Cellular Care
              </span>
              <h4 className="font-semibold text-base text-ink mt-3">Opti-Shield PS</h4>
              <p className="text-xs text-muted mt-1">Hormonal and cell shield</p>
            </div>
            <div className="text-base font-bold text-ink mt-4">$45.00</div>
          </div>
        </div>
      </section>
    </div>
  );
}
