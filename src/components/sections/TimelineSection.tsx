import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, AlertTriangle, Moon, ChevronDown, Database } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { n0, n1 } from '../../lib/format';

type EventType = 'cardio' | 'activity' | 'sleep' | 'anomaly';

interface TEvent {
  key: string;
  date: string;
  type: EventType;
  title: string;
  desc: string;
}

export function TimelineSection() {
  const r = useStore((s) => s.result!);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { activity: a, anomalies } = r;

  // Real, dated events only. Nothing is synthesized from means.
  const events: TEvent[] = [];
  anomalies.rhrSpikeDays.forEach((x) =>
    events.push({ key: `${x.date}-rhr`, date: x.date, type: 'anomaly', title: 'Resting heart rate spike', desc: `Resting HR reached ${n0(x.rhr)} bpm, above your typical range.` }),
  );
  anomalies.hrvCrashDays.forEach((x) =>
    events.push({ key: `${x.date}-hrv`, date: x.date, type: 'anomaly', title: 'HRV dip', desc: `HRV dropped to ${n0(x.hrv)} ms, below your typical range.` }),
  );
  if (anomalies.worstSleep)
    events.push({ key: `${anomalies.worstSleep.date}-sleep`, date: anomalies.worstSleep.date, type: 'sleep', title: 'Shortest night', desc: `Only ${n1(anomalies.worstSleep.hours)}h of sleep, your shortest night in this window.` });
  if (a.stepsMax > 0 && a.stepsMaxDate)
    events.push({ key: `${a.stepsMaxDate}-steps`, date: a.stepsMaxDate, type: 'activity', title: 'Most active day', desc: `${n0(a.stepsMax)} steps, your highest single day.` });

  events.sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : x.key < y.key ? -1 : 1));

  // Same-date lookup into the parallel-array series (dates[]/values[]); '--' when absent.
  const atDate = (seriesKey: string, date: string, fmt: (n: number) => string, unit: string): string => {
    const ser = r.series[seriesKey];
    if (!ser) return '--';
    const i = ser.dates.indexOf(date);
    const v = i >= 0 ? ser.values[i] : null;
    return v == null ? '--' : `${fmt(v)}${unit}`;
  };

  const title = (
    <div>
      <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">Health Journey Timeline</h1>
      <p className="text-sm text-muted">Notable days detected in your data, most recent first. Each event is a real dated reading, not a projection.</p>
    </div>
  );

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        {title}
        <div className="card p-8 border border-line/40 bg-surface/30 flex flex-col items-center justify-center text-center min-h-[240px]">
          <Database size={32} className="text-muted/50 mb-4" />
          <h3 className="text-lg font-bold text-ink">No notable events yet</h3>
          <p className="text-xs text-muted mt-2 max-w-sm leading-relaxed">
            Resting heart rate and HRV stayed within their normal range and no standout days were found in
            this window. As more continuous data is recorded, spikes, dips, and personal bests will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title}

      <div className="relative border-l border-line/40 pl-6 ml-4 space-y-8">
        {events.map((event) => {
          const isExpanded = expanded === event.key;
          return (
            <div key={event.key} className="relative">
              <span className={`absolute -left-[35px] top-1.5 grid h-6.5 w-6.5 place-items-center rounded-full border shadow-sm ${
                event.type === 'cardio' ? 'bg-bad border-bad/70 text-white' :
                event.type === 'sleep' ? 'bg-accent border-accent/70 text-white' :
                event.type === 'activity' ? 'bg-good border-good/70 text-white' :
                'bg-warn border-warn/80 text-white'
              }`}>
                {event.type === 'cardio' && <Heart size={11} />}
                {event.type === 'sleep' && <Moon size={11} />}
                {event.type === 'activity' && <Activity size={11} />}
                {event.type === 'anomaly' && <AlertTriangle size={11} />}
              </span>

              <div
                className="card p-5 border border-line/50 bg-surface/30 hover:border-accent/40 transition-colors cursor-pointer rounded-2xl"
                onClick={() => setExpanded(isExpanded ? null : event.key)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="text-xs font-grotesk text-faint block uppercase tracking-widest tabular-nums">{event.date}</span>
                    <h3 className="font-semibold text-base text-ink mt-1">{event.title}</h3>
                    <p className="text-xs text-muted mt-0.5">{event.desc}</p>
                  </div>
                  <ChevronDown size={16} className={`shrink-0 text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent' : ''}`} />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-line/30 bg-surface-2/10 mt-4 pt-4"
                    >
                      <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold mb-2">Readings that day</span>
                      <div className="grid grid-cols-4 gap-2 text-center text-ink font-semibold">
                        {[
                          { label: 'Sleep', v: atDate('sleep', event.date, n1, 'h') },
                          { label: 'Steps', v: atDate('steps', event.date, n0, '') },
                          { label: 'Rest HR', v: atDate('restingHr', event.date, n0, '') },
                          { label: 'HRV', v: atDate('hrv', event.date, n0, '') },
                        ].map((t) => (
                          <div key={t.label} className="min-w-0 bg-surface-2 p-2 rounded-lg border border-line/30">
                            <span className="text-[9px] text-muted block font-normal">{t.label}</span>
                            <span className="font-grotesk block break-words tabular-nums">{t.v}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted mt-3 leading-relaxed">
                        Values shown are the readings recorded on this date. A dash means that metric was not recorded that day.
                      </p>
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
