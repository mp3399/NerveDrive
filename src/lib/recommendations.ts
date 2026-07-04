import type { AnalysisResult } from '../types/health';

export interface Reco {
  title: string;
  why: string;
  impact: 'Very high' | 'High' | 'Medium' | 'Low';
  effort: 'Low' | 'Medium' | 'High';
}

const RANK = { 'Very high': 4, High: 3, Medium: 2, Low: 1 };

/** Data-driven, prioritised recommendations. Ranked by impact then effort. */
export function buildRecommendations(r: AnalysisResult): Reco[] {
  const { sleep: s, cardio: c, activity: a, scores } = r;
  const recos: Reco[] = [];

  if (s.medianBedH >= 1 && s.medianBedH <= 5)
    recos.push({ title: 'Anchor a fixed wake time, 7 days a week', why: `Your bedtime averages very late (${Math.round(s.bedStdH * 10) / 10}h spread). A fixed wake time is the strongest lever to pull an out-of-phase clock earlier.`, impact: 'Very high', effort: 'Medium' });
  if ((r.extras.daylightMean ?? 60) < 60)
    recos.push({ title: '10 minutes of bright light within 30 min of waking', why: 'Low morning light exposure drives delayed, unstable sleep timing. Morning light advances the clock.', impact: 'Very high', effort: 'Low' });
  if (s.pctUnder6h > 25)
    recos.push({ title: 'Protect a 7-hour sleep window', why: `${Math.round(s.pctUnder6h)}% of nights are under 6h. Chronic short sleep suppresses HRV and raises resting heart rate.`, impact: 'Very high', effort: 'Medium' });
  if (scores['Cardio Fitness'] < 50)
    recos.push({ title: 'Two 20–30 min zone-4 cardio sessions per week', why: `VO₂ max (${c.vo2Latest.toFixed(1)}) is low for your age. Intervals are the fastest way to raise it.`, impact: 'Very high', effort: 'Medium' });
  if (r.workouts.n < 30 || Object.keys(r.workouts.byType).length <= 2)
    recos.push({ title: 'Add two short resistance sessions per week', why: 'Nothing in your data builds muscle. Resistance work protects lean mass a normal BMI can hide the loss of.', impact: 'High', effort: 'Medium' });
  if (a.stepsMedian < 7000)
    recos.push({ title: `Lift weekday steps toward ${a.weekendMean > a.weekdayMean ? '6,000' : '8,000'}`, why: `Median is ${Math.round(a.stepsMedian)}. ${a.weekendMean > a.weekdayMean ? 'Weekdays are where movement dies — add short walks to the workday.' : 'Small structural walks close most of the gap.'}`, impact: 'High', effort: 'Low' });
  recos.push({ title: 'Screens off / dimmed 45 min before target bedtime', why: 'Breaks the late-screen to late-sleep loop driving the phase delay.', impact: 'High', effort: 'Low' });
  recos.push({ title: 'No caffeine after mid-afternoon', why: 'Protects the earlier bedtime you are building.', impact: 'High', effort: 'Low' });
  if (r.body.weightRecords.length < 5)
    recos.push({ title: 'Weigh yourself weekly at the same time', why: 'Turns your biggest blind spot into a trend line for near-zero effort.', impact: 'High', effort: 'Low' });
  recos.push({ title: 'Take a body-composition reading (smart scale or one DEXA)', why: 'The only way to see the muscle-vs-fat question BMI cannot answer.', impact: 'Medium', effort: 'Low' });
  recos.push({ title: 'Get a baseline blood panel (glucose/HbA1c, lipids, vitamin D)', why: 'Fills the clinical gap the watch cannot see.', impact: 'Medium', effort: 'Low' });
  recos.push({ title: 'Hourly stand-and-move during weekday desk time', why: 'Attacks sedentary time directly.', impact: 'Medium', effort: 'Low' });
  if (r.extras.envAudio && r.extras.envAudio.pctOver80 > 3)
    recos.push({ title: 'Use hearing protection in loud environments', why: `${Math.round(r.extras.envAudio.pctOver80)}% of sound readings exceeded 80 dB (peak ${Math.round(r.extras.envAudio.maxDb)} dB).`, impact: 'Low', effort: 'Low' });
  if (r.extras.mindful < 5)
    recos.push({ title: 'Two minutes of breathing before bed', why: 'Mindfulness is near-zero; gentle down-regulation aids sleep onset.', impact: 'Low', effort: 'Low' });
  if (r.dataQuality.watchWearPct < 85)
    recos.push({ title: 'Wear the watch overnight consistently', why: `${Math.round(100 - r.dataQuality.watchWearPct)}% of nights are currently blind, weakening your own future data.`, impact: 'Low', effort: 'Low' });

  return recos.sort((x, y) => RANK[y.impact] - RANK[x.impact] || (x.effort === 'Low' ? -1 : 1)).slice(0, 20);
}
