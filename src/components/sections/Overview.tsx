import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronRight, Activity, Heart, Brain, Moon, Footprints,
  Flame, TrendingUp, TrendingDown, Minus, ShieldCheck, ExternalLink,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { DotMatrixNumber } from '../ui/DotMatrixNumber';
import { estimateBiologicalAge } from '../../lib/analysis';

// ---- helpers ----
const fmt1 = (n: number) => isNaN(n) ? '--' : n.toFixed(1);
const fmtInt = (n: number) => isNaN(n) ? '--' : Math.round(n).toLocaleString();
const hasData = (n: number) => !isNaN(n) && n > 0;

// ---- Superpower Score Status ----
function scoreMeta(score: number): { label: string; color: string; badgeClass: string } {
  if (score >= 90) return { label: 'Peak Performance', color: 'rgb(var(--good))', badgeClass: 'text-good bg-good/10 border-good/30' };
  if (score >= 76) return { label: 'Optimal', color: 'rgb(var(--accent))', badgeClass: 'text-accent bg-accent/10 border-accent/30' };
  if (score >= 60) return { label: 'Building', color: 'rgb(var(--warn))', badgeClass: 'text-warn bg-warn/10 border-warn/30' };
  return { label: 'Needs Attention', color: 'rgb(var(--bad))', badgeClass: 'text-bad bg-bad/10 border-bad/30' };
}

// ---- Radial Arc SVG ----
function RadialArc({ score, size = 100 }: { score: number; size?: number }) {
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const arc = (circumference * 0.75); // 270 degree sweep
  const offset = arc - (arc * Math.min(score, 100)) / 100;
  const startAngle = 135;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(startAngle + 270));
  const y2 = cy + r * Math.sin(toRad(startAngle + 270));
  const path = `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-0">
      {/* Track */}
      <path d={path} fill="none" stroke="rgb(var(--line))" strokeWidth={size * 0.065} strokeLinecap="round" opacity={0.3} />
      {/* Progress */}
      <motion.path
        d={path}
        fill="none"
        stroke="rgb(var(--accent))"
        strokeWidth={size * 0.065}
        strokeLinecap="round"
        strokeDasharray={arc}
        initial={{ strokeDashoffset: arc }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
    </svg>
  );
}

// ---- Vitals trend icon ----
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'up') return <TrendingUp size={12} className="text-good" />;
  if (trend === 'down') return <TrendingDown size={12} className="text-bad" />;
  return <Minus size={12} className="text-muted" />;
}

// ---- Supplement logic ----
interface Supplement {
  name: string;
  reason: string;
  badge: string;
  badgeColor: string;
  blobColor: string;
  priceInr: string;
  amazonQuery: string;
}

function getSupplements(r: {
  cardio: { restingHrMean: number; hrvMean: number; vo2Latest: number };
  sleep: { meanSleepH: number; meanEff: number };
  activity: { stepsMedian: number; weeklyExerciseMin: number };
  scores: Record<string, number>;
  extras: { spo2?: { pctUnder95: number } };
}): Supplement[] {
  const supplements: Supplement[] = [];

  const sleepScore = r.scores['Sleep'] ?? 100;
  const recoveryScore = r.scores['Recovery'] ?? 100;
  const cardioScore = r.scores['Cardio Fitness'] ?? 100;
  const stressScore = r.scores['Stress Resilience'] ?? 100;
  const activityScore = r.scores['Activity'] ?? 100;

  // Sleep - L-Theanine or Magnesium Glycinate
  if (sleepScore < 75 || r.sleep.meanSleepH < 7) {
    supplements.push({
      name: 'Magnesium Glycinate',
      reason: 'Supports deep sleep and reduces sleep latency',
      badge: 'Sleep Support',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      blobColor: 'from-indigo-500 via-purple-500/40 to-transparent',
      priceInr: 'Rs. 899',
      amazonQuery: 'Magnesium+Glycinate+supplement+sleep',
    });
  }

  // HRV / Recovery - Ashwagandha
  if (recoveryScore < 75 || (hasData(r.cardio.hrvMean) && r.cardio.hrvMean < 45)) {
    supplements.push({
      name: 'Ashwagandha KSM-66',
      reason: 'Reduces cortisol, improves HRV and stress resilience',
      badge: 'Best Seller',
      badgeColor: 'text-good bg-good/10 border-good/20',
      blobColor: 'from-good via-emerald-500/40 to-transparent',
      priceInr: 'Rs. 649',
      amazonQuery: 'Ashwagandha+KSM-66+extract+supplement',
    });
  }

  // Cardio / VO2 - Omega-3
  if (cardioScore < 70 || (hasData(r.cardio.restingHrMean) && r.cardio.restingHrMean > 70)) {
    supplements.push({
      name: 'Omega-3 Fish Oil',
      reason: 'Supports cardiovascular health and lowers resting heart rate',
      badge: 'Heart Health',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      blobColor: 'from-blue-500 via-blue-400/40 to-transparent',
      priceInr: 'Rs. 749',
      amazonQuery: 'Omega-3+Fish+Oil+high+potency+supplement',
    });
  }

  // High stress / Low stress resilience - L-Theanine
  if (stressScore < 65) {
    supplements.push({
      name: 'L-Theanine 200mg',
      reason: 'Promotes calm focus and blunts stress cortisol spikes',
      badge: 'Focus & Calm',
      badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      blobColor: 'from-violet-500 via-fuchsia-500/40 to-transparent',
      priceInr: 'Rs. 549',
      amazonQuery: 'L-Theanine+200mg+supplement+stress+relief',
    });
  }

  // Low activity / steps - Creatine
  if (activityScore < 65 || r.activity.stepsMedian < 6000) {
    supplements.push({
      name: 'Creatine Monohydrate',
      reason: 'Boosts exercise capacity, muscle output, and daily energy',
      badge: 'Performance',
      badgeColor: 'text-warn bg-warn/10 border-warn/20',
      blobColor: 'from-orange-500 via-amber-500/40 to-transparent',
      priceInr: 'Rs. 499',
      amazonQuery: 'Creatine+Monohydrate+powder+supplement',
    });
  }

  // SPO2 issues - Vitamin D3+K2
  if (r.extras.spo2 && r.extras.spo2.pctUnder95 > 5) {
    supplements.push({
      name: 'Vitamin D3 + K2',
      reason: 'Supports respiratory health and oxygen saturation levels',
      badge: 'Respiratory',
      badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      blobColor: 'from-yellow-400 via-amber-400/40 to-transparent',
      priceInr: 'Rs. 599',
      amazonQuery: 'Vitamin+D3+K2+supplement+immune+respiratory',
    });
  }

  // Default: always show at least 3
  if (supplements.length < 3) {
    const defaults: Supplement[] = [
      {
        name: 'Ashwagandha KSM-66',
        reason: 'Reduces cortisol and promotes overall physiological resilience',
        badge: 'Best Seller',
        badgeColor: 'text-good bg-good/10 border-good/20',
        blobColor: 'from-good via-emerald-500/40 to-transparent',
        priceInr: 'Rs. 649',
        amazonQuery: 'Ashwagandha+KSM-66+extract+supplement',
      },
      {
        name: 'Magnesium Glycinate',
        reason: 'Supports deep sleep, muscle recovery, and nervous system calm',
        badge: 'Sleep Support',
        badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        blobColor: 'from-indigo-500 via-purple-500/40 to-transparent',
        priceInr: 'Rs. 899',
        amazonQuery: 'Magnesium+Glycinate+supplement+sleep',
      },
      {
        name: 'Omega-3 Fish Oil',
        reason: 'Supports heart health, reduces inflammation, improves HRV',
        badge: 'Heart Health',
        badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        blobColor: 'from-blue-500 via-blue-400/40 to-transparent',
        priceInr: 'Rs. 749',
        amazonQuery: 'Omega-3+Fish+Oil+high+potency+supplement',
      },
    ];
    for (const d of defaults) {
      if (!supplements.find((s) => s.name === d.name)) supplements.push(d);
      if (supplements.length >= 3) break;
    }
  }

  return supplements.slice(0, 3);
}

// ---- AI Insights generator ----
interface InsightDetail {
  title: string;
  badge: string;
  badgeColor: string;
  change: string;
  why: string;
  biomarkers: string[];
  scientific: string;
  confidence: number;
  dataBasis: string;
}

function buildInsights(r: {
  cardio: { restingHrMean: number; hrvMean: number; vo2Latest: number; restingHrFirst: number; restingHrLast: number; hrvFirst: number; hrvLast: number };
  sleep: { meanSleepH: number; meanEff: number; deepPct: number; bedStdH: number; pctUnder6h: number };
  activity: { stepsMedian: number; weeklyExerciseMin: number; activeEnergyMean: number };
  scores: Record<string, number>;
  extras: { spo2?: { mean: number; pctUnder95: number }; daylightMean?: number; mindful: number };
  dataQuality: { daysSpan: number };
}): InsightDetail[] {
  const insights: InsightDetail[] = [];
  const days = r.dataQuality.daysSpan;

  // HRV trend insight
  if (hasData(r.cardio.hrvMean) && hasData(r.cardio.hrvFirst)) {
    const hrvDelta = r.cardio.hrvLast - r.cardio.hrvFirst;
    const improving = hrvDelta > 2;
    const declining = hrvDelta < -2;
    insights.push({
      title: improving
        ? `HRV trending up ${Math.abs(hrvDelta).toFixed(1)}ms - autonomic recovery improving`
        : declining
        ? `HRV dropped ${Math.abs(hrvDelta).toFixed(1)}ms - recovery stress detected`
        : `HRV stable at ${fmt1(r.cardio.hrvMean)}ms - baseline autonomic tone maintained`,
      badge: improving ? 'Improving' : declining ? 'Vigilance' : 'Stable',
      badgeColor: improving
        ? 'text-accent bg-accent/10 border-accent/20'
        : declining
        ? 'text-warn bg-warn/10 border-warn/20'
        : 'text-muted bg-surface-2 border-line',
      change: `${hrvDelta > 0 ? '+' : ''}${fmt1(hrvDelta)}ms HRV trend (30d vs baseline)`,
      why: improving
        ? `Your HRV has risen ${fmt1(Math.abs(hrvDelta))}ms over the analysis window. This reflects a positive adaptation of your parasympathetic nervous system - your body is recovering better from stress and exercise stimuli.`
        : declining
        ? `HRV declined ${fmt1(Math.abs(hrvDelta))}ms. This is typically caused by accumulated physiological debt from training load, sleep deprivation, or elevated cortisol. A recovery week is advised.`
        : `HRV has remained within ${fmt1(r.cardio.hrvMean)}ms baseline. Your autonomic nervous system tone is stable. Continue current recovery protocols.`,
      biomarkers: ['HRV SDNN', 'Parasympathetic Activity', 'Recovery Index'],
      scientific: 'HRV (SDNN) reflects autonomic nervous system balance. Higher SDNN values indicate dominant parasympathetic tone, associated with improved cardiovascular efficiency, reduced all-cause mortality risk, and enhanced cognitive performance.',
      confidence: Math.min(95, 70 + days / 3),
      dataBasis: `${days} days`,
    });
  }

  // Resting HR insight
  if (hasData(r.cardio.restingHrMean)) {
    const rhrDelta = r.cardio.restingHrLast - r.cardio.restingHrFirst;
    const excellent = r.cardio.restingHrMean < 60;
    insights.push({
      title: excellent
        ? `Resting HR ${fmtInt(r.cardio.restingHrMean)} bpm - athletic cardiovascular efficiency`
        : rhrDelta < -2
        ? `Aerobic adaptation detected: RHR dropped ${Math.abs(rhrDelta).toFixed(1)} bpm`
        : `Resting HR ${fmtInt(r.cardio.restingHrMean)} bpm - ${r.cardio.restingHrMean < 70 ? 'within healthy range' : 'above optimal threshold'}`,
      badge: excellent ? 'Highly Optimal' : rhrDelta < -2 ? 'Improving' : r.cardio.restingHrMean < 70 ? 'Stable' : 'Watch',
      badgeColor: excellent
        ? 'text-good bg-good/10 border-good/20'
        : rhrDelta < -2
        ? 'text-accent bg-accent/10 border-accent/20'
        : r.cardio.restingHrMean < 70
        ? 'text-muted bg-surface-2 border-line'
        : 'text-warn bg-warn/10 border-warn/20',
      change: `${rhrDelta < 0 ? '' : '+'}${rhrDelta.toFixed(1)} bpm trend vs baseline`,
      why: excellent
        ? `A resting heart rate below 60 bpm indicates the heart efficiently pumps blood at rest - a hallmark of aerobic fitness. Elite endurance athletes often sit in the 40s.`
        : `Your resting HR of ${fmtInt(r.cardio.restingHrMean)} bpm reflects current cardiac workload. ${r.cardio.restingHrMean > 72 ? 'Consistent Zone 2 aerobic training over 4-8 weeks typically reduces RHR by 3-5 bpm.' : 'Your heart rate indicates adequate cardiovascular conditioning.'}`,
      biomarkers: ['Resting Heart Rate', 'Stroke Volume', 'Cardiac Output'],
      scientific: 'Resting HR is inversely correlated with aerobic capacity. Every 10 bpm reduction in RHR corresponds to roughly 12% lower cardiovascular mortality risk. This reflects increased stroke volume from cardiac hypertrophy.',
      confidence: Math.min(92, 75 + days / 4),
      dataBasis: `${days} days`,
    });
  }

  // Sleep duration insight
  if (hasData(r.sleep.meanSleepH)) {
    const optimal = r.sleep.meanSleepH >= 7 && r.sleep.meanSleepH <= 9;
    const shortSleeper = r.sleep.meanSleepH < 6.5;
    insights.push({
      title: optimal
        ? `Sleep averaging ${fmt1(r.sleep.meanSleepH)}h - within optimal recovery window`
        : shortSleeper
        ? `Chronic short sleep detected: ${fmt1(r.sleep.meanSleepH)}h avg - recovery deficit`
        : `Sleep at ${fmt1(r.sleep.meanSleepH)}h - ${r.sleep.meanSleepH > 9 ? 'extended sleep may signal fatigue' : 'approaching optimal range'}`,
      badge: optimal ? 'Optimal' : shortSleeper ? 'Vigilance' : 'Suboptimal',
      badgeColor: optimal
        ? 'text-good bg-good/10 border-good/20'
        : shortSleeper
        ? 'text-bad bg-bad/10 border-bad/20'
        : 'text-warn bg-warn/10 border-warn/20',
      change: `${fmt1(r.sleep.meanSleepH)}h avg sleep, ${Math.round(r.sleep.pctUnder6h)}% nights under 6h`,
      why: optimal
        ? `Averaging ${fmt1(r.sleep.meanSleepH)} hours of sleep aligns with NSF guidelines (7-9h). This supports HGH secretion during deep sleep and optimal cortisol clearance.`
        : shortSleeper
        ? `Getting under 6.5h regularly creates sleep debt that impairs glucose regulation, immune function, and HRV recovery. Adding 45 minutes consistently has measurable metabolic benefits.`
        : `Your sleep of ${fmt1(r.sleep.meanSleepH)}h is ${r.sleep.meanSleepH < 7 ? 'slightly below' : 'slightly above'} the optimal window. Consistent sleep timing has a larger effect than duration alone.`,
      biomarkers: ['Sleep Duration', 'Deep Sleep %', 'Sleep Efficiency', 'Bedtime Consistency'],
      scientific: `REM and slow-wave sleep stages are critical for memory consolidation, cellular repair, and metabolic restoration. Deep sleep (SWS) accounts for ${r.sleep.deepPct ? fmt1(r.sleep.deepPct) : '~20'}% of your sleep and is the primary window for growth hormone release.`,
      confidence: Math.min(90, 72 + days / 5),
      dataBasis: `${days} days`,
    });
  }

  // Activity / steps insight
  if (hasData(r.activity.stepsMedian)) {
    const meets10k = r.activity.stepsMedian >= 10000;
    const active = r.activity.stepsMedian >= 7000;
    insights.push({
      title: meets10k
        ? `Averaging ${fmtInt(r.activity.stepsMedian)} steps - 10k+ target consistently met`
        : active
        ? `${fmtInt(r.activity.stepsMedian)} daily steps - moderately active, approaching 10k target`
        : `Low daily movement: ${fmtInt(r.activity.stepsMedian)} steps - below activity guidelines`,
      badge: meets10k ? 'Target Met' : active ? 'Moderate' : 'Low Activity',
      badgeColor: meets10k
        ? 'text-good bg-good/10 border-good/20'
        : active
        ? 'text-accent bg-accent/10 border-accent/20'
        : 'text-warn bg-warn/10 border-warn/20',
      change: `${fmtInt(r.activity.stepsMedian)} steps/day median`,
      why: meets10k
        ? `Consistently hitting 10,000+ steps places you in the top quartile for non-exercise activity thermogenesis (NEAT). This alone accounts for significant cardiovascular protective effects.`
        : active
        ? `Your ${fmtInt(r.activity.stepsMedian)} daily steps show solid NEAT. Reaching 10k would add meaningful longevity benefits. Consider a 15-minute walk after dinner.`
        : `Research links under 5,000 steps per day to significantly elevated metabolic risk. Even a 20% increase in daily steps reduces all-cause mortality risk measurably.`,
      biomarkers: ['Daily Steps', 'NEAT', 'Active Energy', 'Exercise Minutes'],
      scientific: `Tudor-Locke norms classify 7,000-9,999 steps as "active". Each additional 1,000 daily steps above 4,000 correlates with a 6% reduction in all-cause mortality risk (Paluch et al., 2021).`,
      confidence: Math.min(88, 68 + days / 4),
      dataBasis: `${days} days`,
    });
  }

  // VO2 Max insight
  if (hasData(r.cardio.vo2Latest)) {
    insights.push({
      title: `VO\u2082 Max ${fmt1(r.cardio.vo2Latest)} mL/kg/min - ${r.cardio.vo2Latest >= 45 ? 'excellent aerobic capacity' : r.cardio.vo2Latest >= 38 ? 'good aerobic fitness' : 'aerobic capacity improvement opportunity'}`,
      badge: r.cardio.vo2Latest >= 45 ? 'Excellent' : r.cardio.vo2Latest >= 38 ? 'Good' : 'Improve',
      badgeColor: r.cardio.vo2Latest >= 45
        ? 'text-good bg-good/10 border-good/20'
        : r.cardio.vo2Latest >= 38
        ? 'text-accent bg-accent/10 border-accent/20'
        : 'text-warn bg-warn/10 border-warn/20',
      change: `${fmt1(r.cardio.vo2Latest)} mL/kg/min`,
      why: `VO\u2082 Max of ${fmt1(r.cardio.vo2Latest)} reflects your aerobic engine capacity. ${r.cardio.vo2Latest >= 45 ? 'This places you in the excellent tier - a strong predictor of longevity and reduced cardiovascular risk.' : 'Zone 2 endurance training (3-4x per week) is the most effective method for improving VO\u2082 Max over 8-12 weeks.'}`,
      biomarkers: ['VO\u2082 Max', 'Aerobic Capacity', 'Lactate Threshold'],
      scientific: 'VO\u2082 Max is the strongest single biomarker predictor of lifespan. Every 1 MET increase (3.5 mL/kg/min) reduces cardiovascular mortality by approximately 12-15% (Mandsager et al., JAMA 2018).',
      confidence: 90,
      dataBasis: 'Latest recorded measurement',
    });
  }

  // Mindfulness / daylight insight (bonus if available)
  if ((r.extras.mindful > 5 || (r.extras.daylightMean && r.extras.daylightMean > 0)) && insights.length < 6) {
    const light = r.extras.daylightMean ? Math.round(r.extras.daylightMean) : null;
    insights.push({
      title: r.extras.mindful > 10
        ? `${r.extras.mindful} mindful sessions recorded - deliberate stress recovery practiced`
        : light
        ? `Avg ${light} min daily daylight exposure - supports circadian alignment`
        : 'Mindful session tracking active',
      badge: 'Lifestyle',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      change: light ? `${light} min/day sunlight` : `${r.extras.mindful} mindful sessions`,
      why: `Morning daylight exposure anchors your circadian clock, improves melatonin onset timing, and supports serotonin synthesis. Mindfulness practice measurably reduces cortisol and improves HRV baseline over 4+ weeks.`,
      biomarkers: ['Circadian Rhythm', 'Cortisol Profile', 'Melatonin Onset'],
      scientific: 'Morning bright light (>1,000 lux) within 30 minutes of waking suppresses late melatonin and anchors the SCN pacemaker. This reduces sleep latency and improves deep sleep consolidation.',
      confidence: 75,
      dataBasis: `${r.extras.mindful} sessions recorded`,
    });
  }

  return insights.slice(0, 5);
}

// ---- Main Component ----
export function Overview() {
  const r = useStore((s) => s.result!);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  const overallScore = r.scores['Overall Health'] ?? 0;
  const scoreMt = scoreMeta(overallScore);

  const bioAgeResult = useMemo(
    () => estimateBiologicalAge(r.profile, r.cardio, r.sleep, r.body),
    [r],
  );

  const insights = useMemo(() => buildInsights(r), [r]);
  const supplements = useMemo(() => getSupplements(r), [r]);

  // ---- Sub-scores for mini progress bars ----
  const subScores: { key: string; label: string; color: string }[] = [
    { key: 'Activity', label: 'Activity', color: '#10b981' },
    { key: 'Cardio Fitness', label: 'Cardio', color: '#3b82f6' },
    { key: 'Recovery', label: 'Recovery', color: '#8b5cf6' },
    { key: 'Sleep', label: 'Sleep', color: '#6366f1' },
    { key: 'Consistency', label: 'Consistency', color: '#f59e0b' },
    { key: 'Stress Resilience', label: 'Stress', color: '#ec4899' },
  ];

  // ---- Daily Vitals data ----
  const rhrVal = hasData(r.cardio.restingHrMean) ? Math.round(r.cardio.restingHrMean) : null;
  const hrvVal = hasData(r.cardio.hrvMean) ? Math.round(r.cardio.hrvMean) : null;
  const sleepVal = hasData(r.sleep.meanSleepH) ? r.sleep.meanSleepH : null;
  const stepsVal = hasData(r.activity.stepsMedian) ? Math.round(r.activity.stepsMedian) : null;
  const vo2Val = hasData(r.cardio.vo2Latest) ? r.cardio.vo2Latest : null;
  const activeKcal = hasData(r.activity.activeEnergyMean) ? Math.round(r.activity.activeEnergyMean) : null;

  const rhrTrend: 'up' | 'down' | 'neutral' =
    hasData(r.cardio.restingHrFirst) && hasData(r.cardio.restingHrLast)
      ? r.cardio.restingHrLast - r.cardio.restingHrFirst < -1 ? 'down' : r.cardio.restingHrLast - r.cardio.restingHrFirst > 1 ? 'up' : 'neutral'
      : 'neutral';
  // For RHR, lower is better - so a 'down' trend is actually good
  const rhrTrendGood = rhrTrend === 'down';

  const hrvTrend: 'up' | 'down' | 'neutral' =
    hasData(r.cardio.hrvFirst) && hasData(r.cardio.hrvLast)
      ? r.cardio.hrvLast - r.cardio.hrvFirst > 1 ? 'up' : r.cardio.hrvLast - r.cardio.hrvFirst < -1 ? 'down' : 'neutral'
      : 'neutral';

  return (
    <div className="space-y-8">
      {/* Personalized Header */}
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">
          {r.profile.name ? `${r.profile.name}'s Dashboard` : 'Dashboard'}
        </h1>
        <p className="text-sm text-muted mt-1">
          {r.dataQuality.daysSpan} days analyzed. Last data: {r.dataQuality.windowEnd}.
        </p>
      </div>

      {/* Hero Grid: Superpower Score | Biological Age | Daily Vitals */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* ---- Superpower Score Widget ---- */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#f59e0b]/5 via-[#10b981]/10 to-[#3b82f6]/5 p-6 shadow-glow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-faint font-semibold">Superpower Score</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${scoreMt.badgeClass}`}>
              {scoreMt.label}
            </span>
          </div>

          {/* Score with radial arc */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <RadialArc score={overallScore} size={88} />
              <div className="absolute inset-0 flex items-center justify-center">
                <DotMatrixNumber value={String(overallScore)} size={5} gap={2} color="rgb(var(--accent))" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-grotesk text-xl font-bold text-ink leading-tight">{scoreMt.label}</div>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">
                Based on {Object.keys(r.scores).length - 1} health pillars
              </p>
            </div>
          </div>

          {/* Mini sub-score progress bars */}
          <div className="mt-5 space-y-2">
            {subScores.map((s) => {
              const val = r.scores[s.key] ?? 0;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="w-16 text-[9px] uppercase tracking-wider text-faint truncate">{s.label}</span>
                  <div className="flex-1 h-1 rounded-full bg-line/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: s.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 0.9, delay: 0.4 }}
                    />
                  </div>
                  <span className="w-6 text-[9px] text-right text-muted">{val}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ---- Biological Age Widget ---- */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-tr from-[#3b82f6]/10 via-[#ec4899]/5 to-[#f59e0b]/5 p-6 shadow-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.12),transparent_50%)] pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-faint font-semibold">Biological Age</span>
            {bioAgeResult.factorsUsed.length > 0 ? (
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bioAgeResult.delta <= 0 ? 'text-accent bg-accent/15 border-accent/20' : 'text-warn bg-warn/10 border-warn/20'}`}>
                {bioAgeResult.delta <= 0 ? `${Math.abs(bioAgeResult.delta)}y Younger` : `+${bioAgeResult.delta}y Older`}
              </span>
            ) : (
              <span className="rounded-full border border-line/30 px-2.5 py-0.5 text-xs text-muted">No Data</span>
            )}
          </div>

          {bioAgeResult.factorsUsed.length > 0 ? (
            <>
              <div className="mt-6 flex items-center gap-4">
                <div className="grid place-items-center h-16 w-16 text-accent bg-surface/40 backdrop-blur-sm rounded-2xl border border-line shrink-0">
                  <DotMatrixNumber value={String(Math.round(bioAgeResult.bioAge))} size={6} gap={2} color="rgb(var(--accent))" />
                </div>
                <div>
                  <div className="font-grotesk text-xl font-bold text-ink">
                    {bioAgeResult.bioAge.toFixed(1)} <span className="text-xs font-normal text-muted">Bio Age</span>
                  </div>
                  <p className="text-[10px] text-muted mt-1 leading-relaxed">
                    Chronological: {r.profile.age}y. Confidence: {bioAgeResult.confidence}.
                  </p>
                </div>
              </div>

              {/* Chronological vs biological comparison bar */}
              <div className="mt-5">
                <div className="flex justify-between text-[9px] text-faint uppercase tracking-wider mb-2">
                  <span>Bio ({bioAgeResult.bioAge.toFixed(1)}y)</span>
                  <span>Chrono ({r.profile.age}y)</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-line/25 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#3b82f6]"
                    style={{ width: `${Math.min(100, (bioAgeResult.bioAge / Math.max(r.profile.age, 1)) * 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (bioAgeResult.bioAge / Math.max(r.profile.age, 1)) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>

              {/* Factors */}
              <div className="mt-4 pt-4 border-t border-line/20">
                <span className="text-[9px] uppercase tracking-wider text-faint">Factors used:</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {bioAgeResult.factorsUsed.map((f) => (
                    <span key={f} className="text-[9px] bg-surface-2 border border-line/30 px-2 py-0.5 rounded-full text-muted">{f}</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8 text-center py-4">
              <Brain size={32} className="text-faint mx-auto mb-2" />
              <p className="text-sm text-muted">Insufficient cardio data</p>
              <p className="text-[10px] text-faint mt-1">Wear your device consistently to enable biological age tracking</p>
            </div>
          )}
        </motion.div>

        {/* ---- Daily Vitals Grid Widget ---- */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-surface/40 backdrop-blur-sm p-6 shadow-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest text-faint font-semibold">Daily Vitals</span>
            <span className="text-[9px] text-faint">30-day avg</span>
          </div>

          {/* 2x2 Vitals Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* RHR */}
            <div className="bg-surface-2/40 border border-line/20 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <Heart size={13} className="text-bad/70" />
                <div className="flex items-center gap-0.5">
                  <TrendIcon trend={rhrTrend === 'down' ? 'down' : rhrTrend === 'up' ? 'up' : 'neutral'} />
                </div>
              </div>
              <div className="font-grotesk font-bold text-2xl text-ink leading-none">
                {rhrVal ?? '--'}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-faint mt-1.5 font-semibold">Resting HR</div>
              <div className="text-[9px] text-muted">bpm</div>
            </div>

            {/* HRV */}
            <div className="bg-surface-2/40 border border-line/20 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <Brain size={13} className="text-accent/70" />
                <TrendIcon trend={hrvTrend} />
              </div>
              <div className="font-grotesk font-bold text-2xl text-ink leading-none">
                {hrvVal ?? '--'}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-faint mt-1.5 font-semibold">HRV SDNN</div>
              <div className="text-[9px] text-muted">ms</div>
            </div>

            {/* Sleep */}
            <div className="bg-surface-2/40 border border-line/20 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <Moon size={13} className="text-indigo-400/70" />
                <TrendIcon trend={sleepVal && sleepVal >= 7 ? 'up' : 'neutral'} />
              </div>
              <div className="font-grotesk font-bold text-2xl text-ink leading-none">
                {sleepVal ? sleepVal.toFixed(1) : '--'}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-faint mt-1.5 font-semibold">Sleep</div>
              <div className="text-[9px] text-muted">hours avg</div>
            </div>

            {/* Steps */}
            <div className="bg-surface-2/40 border border-line/20 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <Footprints size={13} className="text-warn/70" />
                <TrendIcon trend={stepsVal && stepsVal >= 7000 ? 'up' : 'neutral'} />
              </div>
              <div className="font-grotesk font-bold text-2xl text-ink leading-none">
                {stepsVal ? (stepsVal >= 1000 ? `${(stepsVal / 1000).toFixed(1)}k` : stepsVal) : '--'}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-faint mt-1.5 font-semibold">Steps</div>
              <div className="text-[9px] text-muted">daily median</div>
            </div>
          </div>

          {/* Footer row */}
          <div className="mt-3 pt-3 border-t border-line/20 flex items-center justify-between text-[10px] text-muted">
            <div className="flex items-center gap-1">
              <TrendingUp size={11} className="text-accent" />
              <span>VO\u2082: {vo2Val ? `${vo2Val.toFixed(1)} mL/kg/min` : 'No data'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame size={11} className="text-warn" />
              <span>{activeKcal ? `${activeKcal} kcal` : 'No data'}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Health Insights Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-grotesk text-lg font-semibold text-ink flex items-center gap-2">
            <Sparkles size={16} className="text-accent" /> AI Insights Explorer
          </h3>
          <span className="text-xs text-muted">{insights.length} insights from your data</span>
        </div>

        {insights.length === 0 ? (
          <div className="card border border-white/5 bg-surface/30 p-8 text-center rounded-2xl">
            <ShieldCheck size={32} className="text-faint mx-auto mb-3" />
            <p className="text-sm text-muted">Not enough health data for personalized insights.</p>
            <p className="text-xs text-faint mt-1">Upload a health export with at least 30 days of data.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {insights.map((insight, idx) => {
              const isSelected = selectedInsight === idx;
              return (
                <div
                  key={idx}
                  className="card border border-white/5 bg-surface/30 hover:border-accent/40 transition-all rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedInsight(isSelected ? null : idx)}
                >
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 text-[10px] font-bold border px-2 py-0.5 rounded-md ${insight.badgeColor}`}>
                        {insight.badge}
                      </span>
                      <span className="font-semibold text-sm text-ink truncate">{insight.title}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`shrink-0 text-muted transition-transform duration-300 ${isSelected ? 'rotate-90 text-accent' : ''}`}
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
                          <div className="flex items-center gap-3 text-xs text-muted">
                            <span className="font-semibold text-accent">{insight.change}</span>
                            <span className="text-faint">|</span>
                            <span>Based on {insight.dataBasis}</span>
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-widest text-faint font-medium">Detailed Explanation</span>
                            <p className="mt-1.5 text-ink text-sm">{insight.why}</p>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <span className="text-xs uppercase tracking-widest text-faint font-medium">Scientific Basis</span>
                              <p className="mt-1.5 text-xs text-muted leading-relaxed">{insight.scientific}</p>
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
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="h-1.5 w-24 rounded-full bg-line/40 overflow-hidden">
                                    <div className="h-full bg-accent" style={{ width: `${insight.confidence}%` }} />
                                  </div>
                                  <span className="text-xs font-semibold text-ink">{Math.round(insight.confidence)}%</span>
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
        )}
      </section>

      {/* Personalized Supplement Stack */}
      <section className="space-y-4">
        <div>
          <h3 className="font-grotesk text-lg font-semibold text-ink flex items-center gap-2">
            <Activity size={16} className="text-accent" /> Personalized Supplement Stack
          </h3>
          <p className="text-sm text-muted mt-1">
            Chosen specifically for your biometric profile. Links open Amazon India search.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {supplements.map((supp) => (
            <a
              key={supp.name}
              href={`https://www.amazon.in/s?k=${supp.amazonQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 border border-white/5 bg-surface/30 relative overflow-hidden flex flex-col justify-between min-h-[168px] group hover:border-line/50 hover:shadow-glow transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br ${supp.blobColor} blur-xs opacity-70 animate-pulse-soft`} />
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-widest border px-2.5 py-0.5 rounded-full ${supp.badgeColor}`}>
                  {supp.badge}
                </span>
                <h4 className="font-semibold text-base text-ink mt-3">{supp.name}</h4>
                <p className="text-xs text-muted mt-1 leading-snug">{supp.reason}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-base font-bold text-ink">{supp.priceInr}</div>
                <div className="flex items-center gap-1 text-[10px] text-faint group-hover:text-accent transition-colors">
                  <span>Amazon</span>
                  <ExternalLink size={10} />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-surface-2/20 border border-line/20 p-4 rounded-2xl text-xs text-muted">
          <ShieldCheck size={16} className="text-accent shrink-0" />
          <span>Supplement recommendations are AI-generated based on your biometric data. Consult a healthcare provider before starting any supplement protocol.</span>
        </div>
      </section>
    </div>
  );
}
