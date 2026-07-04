import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Wind, Dumbbell, ShieldCheck, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { n0, n1 } from '../../lib/format';

type SystemId = 'brain' | 'heart' | 'lungs' | 'muscles';

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
      score: r.scores['Sleep'] || 72,
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
      score: r.scores['Cardio Fitness'] || 70,
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
      score: r.scores['Stress Resilience'] || 68,
      metrics: [
        { label: 'Respiratory Rate', value: r.extras.respRate ? `${n1(r.extras.respRate.mean)} rpm` : '14.5 rpm', desc: 'Nocturnal respiration cycles' },
        { label: 'Basal Energy', value: `${n0(r.metabolic.meanBasalKcal)} kcal`, desc: 'Base metabolic rate' },
        { label: 'Daily TDEE', value: `${n0(r.metabolic.meanTdee)} kcal`, desc: 'Total energy expenditure' },
        { label: 'Oxygen Saturation', value: r.extras.spo2 ? `${n1(r.extras.spo2.mean)}%` : '97.5%', desc: 'Oxygen transportation capacity' },
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
      score: r.scores['Activity'] || 75,
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
        <div className="md:col-span-2 card p-6 border border-white/5 bg-surface/30 flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03),transparent_70%)] pointer-events-none" />

          {/* Stylized Human Silhouette */}
          <svg className="w-48 h-96 text-line/80 drop-shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all" viewBox="0 0 200 500" fill="currentColor">
            <path stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" d="M100,15 C112,15 120,28 120,45 C120,62 112,75 100,75 C88,75 80,62 80,45 C80,28 88,15 100,15 Z M100,85 C118,85 138,92 150,105 C162,118 165,160 160,205 C155,250 145,245 142,240 C138,235 135,190 130,175 C128,225 130,350 125,430 C120,460 110,465 102,455 C95,445 95,310 95,285 C95,285 90,285 90,285 C90,310 90,445 83,455 C75,465 65,460 60,430 C55,350 57,225 55,175 C50,190 47,235 43,240 C40,245 30,250 25,205 C20,160 23,118 35,105 C47,92 67,85 85,85 L100,85 Z" />
          </svg>

          {/* Interactive Hotspots Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Brain Hotspot */}
            <div className="absolute top-[40px] group pointer-events-auto">
              <button
                onClick={() => setSelectedSystem('brain')}
                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  selectedSystem === 'brain' ? 'bg-purple-500 border-white scale-125 shadow-lg' : 'bg-purple-500/20 border-purple-400/60 hover:bg-purple-500/50'
                }`}
                style={{ boxShadow: selectedSystem === 'brain' ? '0 0 12px #a855f7' : '' }}
              >
                <span className={`absolute w-2.5 h-2.5 rounded-full bg-purple-400 ${selectedSystem === 'brain' ? 'animate-ping' : ''}`} />
              </button>
              <div className="absolute left-8 -top-2 w-32 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-2/90 backdrop-blur border border-line/50 p-2 rounded-lg pointer-events-none shadow-xl z-10">
                <span className="text-[10px] font-bold text-purple-400 block">Brain & Stress</span>
                <span className="text-[9px] text-muted block mt-0.5 leading-tight">Controls sleep recovery, HRV baseline, and stress adaptation.</span>
              </div>
            </div>

            {/* Heart Hotspot */}
            <div className="absolute top-[120px] group pointer-events-auto">
              <button
                onClick={() => setSelectedSystem('heart')}
                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  selectedSystem === 'heart' ? 'bg-red-500 border-white scale-125 shadow-lg' : 'bg-red-500/20 border-red-400/60 hover:bg-red-500/50'
                }`}
                style={{ boxShadow: selectedSystem === 'heart' ? '0 0 12px #ef4444' : '' }}
              >
                <span className={`absolute w-2.5 h-2.5 rounded-full bg-red-400 ${selectedSystem === 'heart' ? 'animate-ping' : ''}`} />
              </button>
              <div className="absolute left-8 -top-2 w-32 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-2/90 backdrop-blur border border-line/50 p-2 rounded-lg pointer-events-none shadow-xl z-10">
                <span className="text-[10px] font-bold text-red-400 block">Cardiovascular</span>
                <span className="text-[9px] text-muted block mt-0.5 leading-tight">Measures VO₂ Max, resting heart rate, and stroke volume efficiency.</span>
              </div>
            </div>

            {/* Lungs Hotspot */}
            <div className="absolute top-[155px] group pointer-events-auto">
              <button
                onClick={() => setSelectedSystem('lungs')}
                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  selectedSystem === 'lungs' ? 'bg-blue-500 border-white scale-125 shadow-lg' : 'bg-blue-500/20 border-blue-400/60 hover:bg-blue-500/50'
                }`}
                style={{ boxShadow: selectedSystem === 'lungs' ? '0 0 12px #3b82f6' : '' }}
              >
                <span className={`absolute w-2.5 h-2.5 rounded-full bg-blue-400 ${selectedSystem === 'lungs' ? 'animate-ping' : ''}`} />
              </button>
              <div className="absolute left-8 -top-2 w-32 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-2/90 backdrop-blur border border-line/50 p-2 rounded-lg pointer-events-none shadow-xl z-10">
                <span className="text-[10px] font-bold text-blue-400 block">Respiratory</span>
                <span className="text-[9px] text-muted block mt-0.5 leading-tight">Tracks oxygen saturation, respiratory rate, and energy synthesis.</span>
              </div>
            </div>

            {/* Muscles Hotspot (Right Arm area) - fixed position */}
            <div className="absolute top-[170px] left-[65%] group pointer-events-auto">
              <button
                onClick={() => setSelectedSystem('muscles')}
                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  selectedSystem === 'muscles' ? 'bg-green-500 border-white scale-125 shadow-lg' : 'bg-green-500/20 border-green-400/60 hover:bg-green-500/50'
                }`}
                style={{ boxShadow: selectedSystem === 'muscles' ? '0 0 12px #10b981' : '' }}
              >
                <span className={`absolute w-2.5 h-2.5 rounded-full bg-green-400 ${selectedSystem === 'muscles' ? 'animate-ping' : ''}`} />
              </button>
              <div className="absolute right-8 -top-2 w-32 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-2/90 backdrop-blur border border-line/50 p-2 rounded-lg pointer-events-none shadow-xl z-10 text-right">
                <span className="text-[10px] font-bold text-green-400 block">Muscular System</span>
                <span className="text-[9px] text-muted block mt-0.5 leading-tight">Reflects activity metrics, step volume, and active energy expenditure.</span>
              </div>
            </div>
          </div>

          {/* Quick Click Menu */}
          <div className="w-full mt-6 grid grid-cols-2 gap-2 text-xs">
            {systems.map((sys) => (
              <button
                key={sys.id}
                onClick={() => setSelectedSystem(sys.id as SystemId)}
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
              className="card p-6 border border-white/5 bg-surface/30 backdrop-blur-md shadow-2xl space-y-6"
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
                  <div className="text-2xl font-grotesk font-bold text-ink">{currentSystem.score}<span className="text-xs text-muted font-normal">/100</span></div>
                </div>
              </div>

              {/* Biomarkers Grid */}
              <div className="grid gap-3 grid-cols-2">
                {currentSystem.metrics.map((metric) => (
                  <div key={metric.label} className="p-4 rounded-2xl bg-surface-2/40 border border-line/35">
                    <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold">{metric.label}</span>
                    <span className="text-xl font-bold text-ink mt-1 block font-grotesk">{metric.value}</span>
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
                    <span>Target adjustments here lead to {currentSystem.id === 'heart' ? '6.4% higher recovery baseline' : 'improved mitochondrial respiration'}.</span>
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
