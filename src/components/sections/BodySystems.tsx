import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Wind, Dumbbell, ShieldCheck, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { n0, n1 } from '../../lib/format';

type SystemId = 'brain' | 'heart' | 'lungs' | 'muscles';

// Hotspot anchors are expressed as percentages of the figure box (viewBox 200x500),
// so the dots track the silhouette at every size instead of drifting. `tip` picks the
// tooltip open direction (top dots open downward, lower dots upward) to avoid the
// card's overflow-hidden clip.
const HOTSPOTS: Record<SystemId, { left: string; top: string; tip: 'up' | 'down' }> = {
  brain: { left: '50%', top: '9%', tip: 'down' },
  heart: { left: '45%', top: '30%', tip: 'down' },
  lungs: { left: '57%', top: '28%', tip: 'down' },
  muscles: { left: '40%', top: '68%', tip: 'up' },
};

const TIP_COPY: Record<SystemId, string> = {
  brain: 'Controls sleep recovery, HRV baseline, and stress adaptation.',
  heart: 'Measures VO₂ Max, resting heart rate, and stroke volume efficiency.',
  lungs: 'Tracks oxygen saturation, respiratory rate, and energy synthesis.',
  muscles: 'Reflects activity metrics, step volume, and active energy expenditure.',
};

export function BodySystems() {
  const r = useStore((s) => s.result!);
  const [selectedSystem, setSelectedSystem] = useState<SystemId>('heart');

  const { cardio: c, sleep: s, activity: a } = r;

  const systems = [
    {
      id: 'brain',
      name: 'Brain (Sleep & Stress)',
      icon: Brain,
      color: '#a855f7', // purple
      score: r.scores['Sleep'],
      metrics: [
        { label: 'Sleep Efficiency', value: `${Math.round(s.meanEff)}%`, desc: 'Target > 85%' },
        { label: 'Nocturnal Duration', value: `${n1(s.meanSleepH)}h`, desc: 'Average sleep time' },
        { label: 'Bedtime Consistency', value: `±${n0(s.bedStdH * 60)}m`, desc: 'Target variance < 30m' },
        { label: 'Nights < 6h', value: `${Math.round(s.pctUnder6h)}%`, desc: 'Ideal threshold < 15%' },
      ],
      description: 'Your neurological recovery and circadian rhythm. Deep and REM sleep are vital for cognitive repair and emotional regulation.',
      contributors: ['Sleep latency', 'Screen time prior to sleep', 'Circadian consistency'],
      recommendations: [
        'Maintain a consistent wake-up window even on weekends.',
        'Adopt a dark hour protocol: block digital screens 60 minutes before bed.',
      ],
    },
    {
      id: 'heart',
      name: 'Heart (Cardiovascular)',
      icon: Heart,
      color: '#ef4444', // red
      score: r.scores['Cardio Fitness'],
      metrics: [
        { label: 'Resting Heart Rate', value: `${n0(c.restingHrMean)} bpm`, desc: `Baseline ${n0(c.restingHrFirst)} → ${n0(c.restingHrLast)}` },
        { label: 'Heart Rate Variability', value: `${n0(c.hrvMean)} ms`, desc: 'Autonomic nervous resilience' },
        { label: 'VO₂ Max Estimate', value: `${n1(c.vo2Latest)} ml/kg`, desc: 'Aerobic fitness indicator' },
        { label: 'Total HR Readings', value: n0(c.hrReadings), desc: 'Analyzed beats' },
      ],
      description: 'Your central cardiovascular system. Resting HR and HRV reflect parasympathetic control and cellular stress adaptation.',
      contributors: ['Aerobic capacity', 'Active heart rate zones', 'Myocardial stroke volume'],
      recommendations: [
        'Integrate 45 minutes of Zone 2 cardio twice a week.',
        'Avoid high glycemic index meals near bedtime to lower nocturnal resting heart rate.',
      ],
    },
    {
      id: 'lungs',
      name: 'Lungs (Respiratory & Metabolic)',
      icon: Wind,
      color: '#3b82f6', // blue
      score: r.scores['Stress Resilience'],
      metrics: [
        { label: 'Respiratory Rate', value: r.extras.respRate ? `${n1(r.extras.respRate.mean)} rpm` : '--', desc: 'Nocturnal respiration cycles' },
        { label: 'Basal Energy', value: `${n0(r.metabolic.meanBasalKcal)} kcal`, desc: 'Base metabolic rate' },
        { label: 'Daily TDEE', value: `${n0(r.metabolic.meanTdee)} kcal`, desc: 'Total energy expenditure' },
        { label: 'Oxygen Saturation', value: r.extras.spo2 ? `${n1(r.extras.spo2.mean)}%` : '--', desc: 'Oxygen transportation capacity' },
      ],
      description: 'Respiratory efficiency and metabolic rate. Oxygenation levels control energy synthesis and tissue regeneration.',
      contributors: ['Respiration capacity', 'Hemoglobin binding efficiency', 'Aerobic thresholds'],
      recommendations: [
        'Utilize nose-breathing exercises during active exercise to strengthen lung volume.',
        'Incorporate breathwork (e.g., box breathing) to balance respiratory chemistry.',
      ],
    },
    {
      id: 'muscles',
      name: 'Muscles (Activity & Fitness)',
      icon: Dumbbell,
      color: '#10b981', // green
      score: r.scores['Activity'],
      metrics: [
        { label: 'Daily Step Median', value: n0(a.stepsMedian), desc: `${Math.round(a.pctDaysOver10k)}% of days ≥10k steps` },
        { label: 'Active Energy', value: `${n0(a.activeEnergyMean)} kcal`, desc: 'Average active daily burn' },
        { label: 'Exercise Minutes', value: `${n0(a.exerciseMinMean)} m`, desc: 'Daily average exercise time' },
        { label: 'Weekly Active Time', value: `${n0(a.weeklyExerciseMin)} m`, desc: 'Target: >150 minutes/week' },
      ],
      description: 'Your skeletal musculature and activity profile. Consistent movement and workouts regulate blood sugar and maintain mobility.',
      contributors: ['Step counts', 'Active resistance exercise', 'Bone density stimulations'],
      recommendations: [
        'Set a vibration alert for sedentary times (longer than 50 minutes of sitting).',
        'Incorporate three 20-minute bodyweight resistance circuits per week.',
      ],
    },
  ];

  const currentSystem = systems.find((s) => s.id === selectedSystem)!;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">Body Systems Map</h1>
        <p className="text-sm text-muted">Click on the anatomical map hotspots to inspect specific bodily functions and biomarkers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-5 items-start">
        {/* Left Column: Stylized Anatomical Graphic */}
        <div className="md:col-span-2 card p-6 border border-line/60 bg-surface/30 flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

          {/* Figure box: hotspots anchor to THIS box (viewBox ratio 2:5), so they never drift */}
          <div className="relative mx-auto w-full max-w-[150px] aspect-[2/5]">
            <svg
              viewBox="0 0 200 500"
              className="absolute inset-0 h-full w-full text-line/70 drop-shadow-[0_0_16px_rgba(16,185,129,0.16)] pointer-events-none"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* Body silhouette */}
              <path stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" d="M100,15 C112,15 120,28 120,45 C120,62 112,75 100,75 C88,75 80,62 80,45 C80,28 88,15 100,15 Z M100,85 C118,85 138,92 150,105 C162,118 165,160 160,205 C155,250 145,245 142,240 C138,235 135,190 130,175 C128,225 130,350 125,430 C120,460 110,465 102,455 C95,445 95,310 95,285 C95,285 90,285 90,285 C90,310 90,445 83,455 C75,465 65,460 60,430 C55,350 57,225 55,175 C50,190 47,235 43,240 C40,245 30,250 25,205 C20,160 23,118 35,105 C47,92 67,85 85,85 L100,85 Z" />

              {/* Low-opacity anatomical hints (decorative, non-interactive) */}
              <g strokeLinecap="round">
                {/* Brain */}
                <ellipse cx="100" cy="45" rx="15" ry="13" fill="#a855f7" fillOpacity="0.16" />
                <path d="M93,40 C97,36 103,36 107,40 M92,46 C97,50 103,50 108,46" fill="none" stroke="#a855f7" strokeOpacity="0.4" strokeWidth="1.4" />
                {/* Lungs (behind heart) */}
                <path d="M86,132 C74,136 72,158 82,172 C88,178 90,170 90,158 L90,134 C89,132 87,132 86,132 Z" fill="#3b82f6" fillOpacity="0.14" stroke="#3b82f6" strokeOpacity="0.28" strokeWidth="1.2" />
                <path d="M114,132 C126,136 128,158 118,172 C112,178 110,170 110,158 L110,134 C111,132 113,132 114,132 Z" fill="#3b82f6" fillOpacity="0.14" stroke="#3b82f6" strokeOpacity="0.28" strokeWidth="1.2" />
                {/* Heart */}
                <path d="M100,148 C96,140 84,141 84,152 C84,163 100,172 100,172 C100,172 116,163 116,152 C116,141 104,140 100,148 Z" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeOpacity="0.35" strokeWidth="1.2" />
                {/* Muscle accents (thighs) */}
                <ellipse cx="80" cy="345" rx="11" ry="46" fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeOpacity="0.22" strokeWidth="1.2" />
                <ellipse cx="120" cy="345" rx="11" ry="46" fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeOpacity="0.22" strokeWidth="1.2" />
              </g>
            </svg>

            {/* Hotspot dots: children of the figure box, anchored by left%/top% */}
            <div className="absolute inset-0 pointer-events-none">
              {systems.map((sys) => {
                const pos = HOTSPOTS[sys.id as SystemId];
                const active = selectedSystem === sys.id;
                return (
                  <div
                    key={sys.id}
                    className="group absolute pointer-events-auto"
                    style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
                  >
                    <button
                      onClick={() => setSelectedSystem(sys.id as SystemId)}
                      aria-label={sys.name}
                      aria-pressed={active}
                      className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-transform ${active ? 'scale-125' : 'hover:scale-110'}`}
                      style={{
                        backgroundColor: active ? sys.color : `${sys.color}33`,
                        borderColor: active ? '#ffffff' : `${sys.color}99`,
                        boxShadow: active ? `0 0 14px ${sys.color}` : `0 0 6px ${sys.color}66`,
                      }}
                    >
                      {/* pulse halo, child of the button so it never intercepts the click */}
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full ${active ? 'animate-ping opacity-60' : 'animate-pulse opacity-25'}`}
                        style={{ backgroundColor: sys.color }}
                      />
                      <span className="relative h-2 w-2 rounded-full" style={{ backgroundColor: active ? '#ffffff' : sys.color }} />
                    </button>
                    {/* tooltip opens vertically to avoid the card overflow-hidden clip */}
                    <div
                      className={`pointer-events-none absolute left-1/2 z-20 w-36 -translate-x-1/2 rounded-lg border border-line/50 bg-surface-2/90 p-2 text-center opacity-0 shadow-xl backdrop-blur transition-opacity group-hover:opacity-100 ${pos.tip === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'}`}
                    >
                      <span className="block text-[10px] font-bold" style={{ color: sys.color }}>
                        {sys.name.split(' (')[0]}
                      </span>
                      <span className="mt-0.5 block text-[9px] leading-tight text-muted">{TIP_COPY[sys.id as SystemId]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Click Menu */}
          <div className="w-full mt-6 grid grid-cols-2 gap-2 text-xs">
            {systems.map((sys) => (
              <button
                key={sys.id}
                onClick={() => setSelectedSystem(sys.id as SystemId)}
                aria-pressed={selectedSystem === sys.id}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                  selectedSystem === sys.id ? 'bg-surface-2 text-ink border-line' : 'bg-transparent text-muted border-transparent hover:text-ink'
                }`}
              >
                {sys.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Insights Card */}
        <div className="md:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSystem.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
              className="card p-6 border border-line/60 bg-surface/30 backdrop-blur-md shadow-2xl space-y-6"
            >
              {/* Header inside details card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl text-ink" style={{ backgroundColor: `${currentSystem.color}20`, color: currentSystem.color }}>
                    <currentSystem.icon size={22} />
                  </div>
                  <div>
                    <h2 className="font-grotesk text-xl font-bold text-ink">{currentSystem.name}</h2>
                    <span className="text-xs text-muted">Integrity & recovery markers</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-faint uppercase font-semibold">Functional Score</div>
                  <div className="text-2xl font-grotesk font-bold text-ink">{Number.isFinite(currentSystem.score) ? currentSystem.score : '--'}<span className="text-xs text-muted font-normal">/100</span></div>
                </div>
              </div>

              {/* Biomarkers Grid */}
              <div className="grid gap-3 grid-cols-2">
                {currentSystem.metrics.map((metric) => (
                  <div key={metric.label} className="min-w-0 p-4 rounded-2xl bg-surface-2/40 border border-line/35">
                    <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold">{metric.label}</span>
                    <span className="text-xl font-bold text-ink mt-1 block font-grotesk truncate tabular-nums">{metric.value}</span>
                    <span className="text-[10px] text-muted mt-0.5 block">{metric.desc}</span>
                  </div>
                ))}
              </div>

              {/* Narrative description */}
              <div className="space-y-1 bg-surface-2/20 p-4 rounded-2xl border border-line/20">
                <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold">System Description</span>
                <p className="text-xs text-muted leading-relaxed">{currentSystem.description}</p>
              </div>

              {/* Contributors / Risk factors */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs uppercase tracking-widest text-faint font-semibold block mb-2">Contributing Factors</span>
                  <ul className="space-y-1.5 text-xs text-muted">
                    {currentSystem.contributors.map((c) => (
                      <li key={c} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-faint font-semibold block mb-2">Scientific Outlook</span>
                  <div className="flex items-start gap-2 bg-accent/5 border border-accent/20 p-2.5 rounded-xl text-xs text-accent">
                    <TrendingUp size={14} className="shrink-0 mt-0.5" />
                    <span>Consistent improvements to this system support a stronger recovery baseline over time.</span>
                  </div>
                </div>
              </div>

              {/* Action recommendations */}
              <div className="pt-4 border-t border-line/35">
                <span className="text-xs uppercase tracking-widest text-faint font-semibold block mb-3">AI Coach Interventions</span>
                <div className="space-y-2">
                  {currentSystem.recommendations.map((rec) => (
                    <div key={rec} className="flex items-start gap-3 bg-surface-2/30 border border-line/30 p-3 rounded-xl text-xs leading-relaxed text-ink">
                      <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
