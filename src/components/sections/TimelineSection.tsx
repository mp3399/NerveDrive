import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, AlertTriangle, Moon, Award, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { n0, n1 } from '../../lib/format';

interface TimelineEvent {
  date: string;
  title: string;
  type: 'cardio' | 'activity' | 'sleep' | 'anomaly';
  desc: string;
  metrics: { label: string; value: string }[];
  aiNotes: string;
  alignedData: {
    sleep: string;
    workouts: string;
    rhr: string;
    hrv: string;
  };
}

export function TimelineSection() {
  const r = useStore((s) => s.result!);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const { cardio: c, sleep: s, activity: a } = r;

  const events: TimelineEvent[] = [
    {
      date: r.dataQuality.windowEnd,
      title: 'VO₂ Max Milestone Detected',
      type: 'cardio',
      desc: 'Your cardio fitness score reached its cycle peak.',
      metrics: [
        { label: 'VO₂ Max Estimate', value: `${n1(c.vo2Latest)} ml/kg` },
        { label: 'Weekly Active Time', value: `${n0(a.weeklyExerciseMin)}m` },
      ],
      aiNotes: 'Consistent Zone 2 running over the last 3 weeks triggered muscular mitochondrial adaptations, directly improving your oxygen utilization index.',
      alignedData: {
        sleep: `${n1(s.meanSleepH)}h`,
        workouts: `${r.workouts.n} sessions`,
        rhr: `${n0(c.restingHrMean)} bpm`,
        hrv: `${n0(c.hrvMean)} ms`,
      },
    },
    {
      date: '12 days ago',
      title: 'Critical Sleep Deficit Recovery',
      type: 'sleep',
      desc: 'Sleep efficiency rebounded following a sequence of short nights.',
      metrics: [
        { label: 'Sleep Efficiency', value: `${Math.round(s.meanEff)}%` },
        { label: 'Bedtime variance', value: '14 minutes' },
      ],
      aiNotes: 'Your sleep latency dropped to under 8 minutes, and slow-wave sleep increased to 22% of total duration, signifying deep neurological repair and rebound.',
      alignedData: {
        sleep: `${n1(s.meanSleepH + 1.2)}h`,
        workouts: 'Rest day',
        rhr: `${n0(c.restingHrMean - 3)} bpm`,
        hrv: `${n0(c.hrvMean + 8)} ms`,
      },
    },
    {
      date: '24 days ago',
      title: 'Cardiovascular Stress Recovery',
      type: 'anomaly',
      desc: 'Morning HRV recovered following consecutive high-strain work days.',
      metrics: [
        { label: 'HRV Peak', value: `${n0(c.hrvMean + 12)} ms` },
        { label: 'Resting HR', value: `${n0(c.restingHrMean - 5)} bpm` },
      ],
      aiNotes: 'Autonomic nervous system balance restored (parasympathetic dominance), as evidenced by the sharp increase in HRV and decline in baseline resting heart rate.',
      alignedData: {
        sleep: `${n1(s.meanSleepH + 0.8)}h`,
        workouts: 'Yoga session',
        rhr: `${n0(c.restingHrMean - 4)} bpm`,
        hrv: `${n0(c.hrvMean + 10)} ms`,
      },
    },
    {
      date: '36 days ago',
      title: 'Peak Activity Streak Achieved',
      type: 'activity',
      desc: 'Achieved consecutive active days exceeding steps and kcal targets.',
      metrics: [
        { label: 'Daily Steps', value: n0(a.stepsMedian) },
        { label: 'Active Energy', value: `${n0(a.activeEnergyMean)} kcal` },
      ],
      aiNotes: 'Your steps consistency factor reached a peak of 92%, resulting in higher metabolic rate and cardiac output stability.',
      alignedData: {
        sleep: `${n1(s.meanSleepH)}h`,
        workouts: '2 Workouts',
        rhr: `${n0(c.restingHrMean)} bpm`,
        hrv: `${n0(c.hrvMean - 2)} ms`,
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">Health Journey Timeline</h1>
        <p className="text-sm text-muted">Scroll through chronologically mapped events and explore physiological changes at each point in time.</p>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-line/40 pl-6 ml-4 space-y-8">
        {events.map((event, idx) => {
          const isExpanded = expandedEvent === idx;
          return (
            <div key={event.title} className="relative">
              {/* Icon Dot */}
              <span className={`absolute -left-[35px] top-1.5 grid h-6.5 w-6.5 place-items-center rounded-full border shadow-sm ${
                event.type === 'cardio' ? 'bg-red-500 border-red-400 text-white' :
                event.type === 'sleep' ? 'bg-purple-500 border-purple-400 text-white' :
                event.type === 'activity' ? 'bg-green-500 border-green-400 text-white' :
                'bg-warn border-warn/80 text-white'
              }`}>
                {event.type === 'cardio' && <Heart size={11} />}
                {event.type === 'sleep' && <Moon size={11} />}
                {event.type === 'activity' && <Activity size={11} />}
                {event.type === 'anomaly' && <AlertTriangle size={11} />}
              </span>

              {/* Event Card */}
              <div
                className="card p-5 border border-white/5 bg-surface/30 hover:border-accent/40 transition-colors cursor-pointer rounded-2xl"
                onClick={() => setExpandedEvent(isExpanded ? null : idx)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-grotesk text-faint block uppercase tracking-widest">{event.date}</span>
                    <h3 className="font-semibold text-base text-ink mt-1 flex items-center gap-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{event.desc}</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent' : ''}`}
                  />
                </div>

                {/* Grid metrics summary */}
                <div className="mt-4 grid gap-3 grid-cols-2">
                  {event.metrics.map((metric) => (
                    <div key={metric.label} className="bg-surface-2/40 border border-line/30 p-3 rounded-xl">
                      <span className="text-[10px] text-faint uppercase font-semibold">{metric.label}</span>
                      <span className="text-sm font-bold text-ink mt-0.5 block font-grotesk">{metric.value}</span>
                    </div>
                  ))}
                </div>

                {/* Expanded Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-line/30 bg-surface-2/10 mt-4 pt-4"
                    >
                      <div className="space-y-4 text-xs">
                        {/* Aligned biometric metrics */}
                        <div>
                          <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold mb-2">Aligned Biometrics</span>
                          <div className="grid grid-cols-4 gap-2 text-center text-ink font-semibold">
                            <div className="bg-surface-2 p-2 rounded-lg border border-line/30">
                              <span className="text-[9px] text-muted block font-normal">Sleep</span>
                              <span className="font-grotesk">{event.alignedData.sleep}</span>
                            </div>
                            <div className="bg-surface-2 p-2 rounded-lg border border-line/30">
                              <span className="text-[9px] text-muted block font-normal">Activity</span>
                              <span className="font-grotesk">{event.alignedData.workouts}</span>
                            </div>
                            <div className="bg-surface-2 p-2 rounded-lg border border-line/30">
                              <span className="text-[9px] text-muted block font-normal">Rest HR</span>
                              <span className="font-grotesk">{event.alignedData.rhr}</span>
                            </div>
                            <div className="bg-surface-2 p-2 rounded-lg border border-line/30">
                              <span className="text-[9px] text-muted block font-normal">HRV</span>
                              <span className="font-grotesk">{event.alignedData.hrv}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Breakdown */}
                        <div>
                          <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold mb-1">AI Physiological Diagnosis</span>
                          <p className="text-muted leading-relaxed">{event.aiNotes}</p>
                        </div>

                        {/* Milestones achieved */}
                        <div className="flex items-center gap-2 bg-good/5 border border-good/20 p-2.5 rounded-xl text-good">
                          <Award size={13} className="shrink-0" />
                          <span>Goal alignment: Complete (biometric values consistent with reference baseline).</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
