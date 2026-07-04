/** Turns a Parsed export into a full AnalysisResult. Framework-free, worker-safe. */
import type { Parsed } from './parse';
import type { AnalysisResult, Profile, Status, Series } from '../types/health';
import { mean, median, quantile, std, corr, longestStreak, clamp, dateRange } from './stats';

const wallMs = (s: string) => Date.parse(s.slice(0, 19).replace(' ', 'T') + 'Z');
const dayStr = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const mondayIdx = (d: string) => (new Date(d + 'T00:00:00Z').getUTCDay() + 6) % 7;
const monthKey = (d: string) => d.slice(0, 7);

/** Detect the dense-data window: skip stray old fragments separated by a >45d gap. */
function detectWindow(days: string[]): { start: string; strayCount: number } {
  if (!days.length) return { start: '', strayCount: 0 };
  const sorted = [...days].sort();
  let start = sorted[0];
  let strayCount = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap =
      (Date.parse(sorted[i]) - Date.parse(sorted[i - 1])) / 86400000;
    if (gap > 45) {
      strayCount += i; // everything before this index is stray
      start = sorted[i];
    }
  }
  // recompute stray as count strictly before start
  strayCount = sorted.filter((d) => d < start).length;
  return { start, strayCount };
}

export function analyze(p: Parsed, profile: Profile): AnalysisResult {
  // ---------- steps daily (max across sources per day) ----------
  const stepDaysAll: string[] = [...p.stepByDay.keys()];
  const { start: windowStart, strayCount } = detectWindow(stepDaysAll);
  const stepDaily = new Map<string, number>();
  for (const [d, m] of p.stepByDay) {
    if (d < windowStart) continue;
    stepDaily.set(d, Math.max(...m.values()));
  }
  const winDays = stepDaily.size
    ? dateRange(windowStart, [...stepDaily.keys()].sort().pop()!)
    : [];
  const stepsFull = winDays.map((d) => stepDaily.get(d) ?? null);
  const stepVals = [...stepDaily.values()];
  const stepSorted = [...stepVals].sort((a, b) => a - b);

  const maxStep = Math.max(...stepVals, 0);
  let maxStepDate = '';
  for (const [d, v] of stepDaily) if (v === maxStep) maxStepDate = d;

  const wd = winDays.filter((d) => mondayIdx(d) < 5).map((d) => stepDaily.get(d)).filter((v): v is number => v != null);
  const we = winDays.filter((d) => mondayIdx(d) >= 5).map((d) => stepDaily.get(d)).filter((v): v is number => v != null);
  const byDow = Array.from({ length: 7 }, (_, i) => {
    const vals = winDays.filter((d) => mondayIdx(d) === i).map((d) => stepDaily.get(d)).filter((v): v is number => v != null);
    return vals.length ? mean(vals) : 0;
  });
  const byMonth: Record<string, number> = {};
  {
    const g: Record<string, number[]> = {};
    for (const [d, v] of stepDaily) (g[monthKey(d)] ??= []).push(v);
    for (const k of Object.keys(g).sort()) byMonth[k] = mean(g[k]);
  }

  const dayAgg = (m: Map<string, number>) =>
    winDays.map((d) => (m.has(d) ? m.get(d)! : null));
  const activeSeries = dayAgg(p.activeByDay);
  const activeVals = activeSeries.filter((v): v is number => v != null);
  const exVals = winDays.map((d) => p.exerciseByDay.get(d)).filter((v): v is number => v != null);
  const distTotal = [...p.distByDay.entries()].filter(([d]) => d >= windowStart).reduce((s, [, v]) => s + v, 0);

  // ---------- cardio ----------
  const dailyMean = (arr: { d: string; v: number }[]) => {
    const g: Record<string, number[]> = {};
    for (const { d, v } of arr) if (d >= windowStart) (g[d] ??= []).push(v);
    const days = Object.keys(g).sort();
    return days.map((d) => ({ d, v: mean(g[d]) }));
  };
  const rhrDaily = dailyMean(p.restingHr);
  const hrvDaily = dailyMean(p.hrv);
  const vo2Sorted = [...p.vo2].filter((x) => x.d >= windowStart).sort((a, b) => a.d.localeCompare(b.d));
  const firstN = (a: { v: number }[], n: number) => a.slice(0, n).map((x) => x.v);
  const lastN = (a: { v: number }[], n: number) => a.slice(-n).map((x) => x.v);
  const hourlyHr = p.hrHourSum.map((s, i) => (p.hrHourCnt[i] ? s / p.hrHourCnt[i] : 0));
  const zoneLabels = ['<50%', '50-60%', '60-70%', '70-80%', '80-90%', '90%+'];
  const hrZones: Record<string, number> = {};
  zoneLabels.forEach((l, i) => (hrZones[l] = p.hrZones[i]));

  // ---------- sleep ----------
  type Night = { night: string; total: number; bed: number; wake: number; deep: number; rem: number; core: number; eff: number };
  const byNight = new Map<string, typeof p.sleep>();
  for (const seg of p.sleep) {
    const nb = dayStr(wallMs(seg.start) - 12 * 3600000);
    if (nb < windowStart) continue;
    (byNight.get(nb) ?? byNight.set(nb, []).get(nb)!).push(seg);
  }
  const nights: Night[] = [];
  const asleepStages = new Set(['AsleepCore', 'AsleepDeep', 'AsleepREM', 'AsleepUnspecified', 'Asleep']);
  for (const [nb, segs] of byNight) {
    const asleep = segs.filter((s) => asleepStages.has(s.stage));
    if (!asleep.length) continue;
    const inWindow = asleep.filter((s) => {
      const h = parseInt(s.start.slice(11, 13), 10) || 0;
      return h >= 19 || h <= 11;
    });
    const main = inWindow.length ? inWindow : asleep;
    const dur = (s: { start: string; end: string }) => (wallMs(s.end) - wallMs(s.start)) / 3600000;
    const total = main.reduce((a, s) => a + dur(s), 0);
    if (total < 2 || total > 14) continue;
    const bedMs = Math.min(...main.map((s) => wallMs(s.start)));
    const wakeMs = Math.max(...main.map((s) => wallMs(s.end)));
    const win = (wakeMs - bedMs) / 3600000;
    const stageSum = (name: string) =>
      segs.filter((s) => s.stage === name && wallMs(s.start) >= bedMs && wallMs(s.end) <= wakeMs + 60000).reduce((a, s) => a + dur(s), 0);
    const bd = new Date(bedMs);
    const wk = new Date(wakeMs);
    nights.push({
      night: nb,
      total,
      bed: bd.getUTCHours() + bd.getUTCMinutes() / 60,
      wake: wk.getUTCHours() + wk.getUTCMinutes() / 60,
      deep: stageSum('AsleepDeep'),
      rem: stageSum('AsleepREM'),
      core: stageSum('AsleepCore'),
      eff: win > 0 ? Math.min((total / win) * 100, 100) : NaN,
    });
  }
  nights.sort((a, b) => a.night.localeCompare(b.night));
  const totalArr = nights.map((n) => n.total);
  const bedWrapped = nights.map((n) => (n.bed < 12 ? n.bed + 24 : n.bed));
  const staged = nights.filter((n) => n.deep + n.rem + n.core > 0);
  const stageTot = staged.reduce((a, n) => a + n.deep + n.rem + n.core, 0) || 1;
  const wdSleep = nights.filter((n) => mondayIdx(n.night) < 5).map((n) => n.total);
  const weSleep = nights.filter((n) => mondayIdx(n.night) >= 5).map((n) => n.total);

  // ---------- body ----------
  const weightRecs = [...p.weight].sort((a, b) => a.d.localeCompare(b.d)).map((w) => ({ date: w.d.slice(0, 10), value: w.v }));
  const weightLatest = weightRecs.length ? weightRecs[weightRecs.length - 1].value : undefined;
  const heightM = p.heightCm ? p.heightCm / 100 : undefined;
  const bmi = weightLatest && heightM ? weightLatest / heightM ** 2 : undefined;
  const bmiCat = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese') : undefined;

  // ---------- workouts ----------
  const wk = p.workouts.filter((w) => w.start >= windowStart);
  const wkByType: Record<string, number> = {};
  for (const w of wk) wkByType[w.type] = (wkByType[w.type] ?? 0) + 1;
  const wkSpanWeeks = wk.length ? (Date.parse(wk[wk.length - 1].start) - Date.parse(wk[0].start)) / 6.048e8 + 1 : 1;

  // ---------- metabolic ----------
  const basalVals = [...p.basalByDay.entries()].filter(([d]) => d >= windowStart).map(([, v]) => v);
  const meanActive = activeVals.length ? mean(activeVals) : 0;
  const meanBasal = basalVals.length ? mean(basalVals) : 0;

  // ---------- correlations ----------
  const rhrMap = new Map(rhrDaily.map((x) => [x.d, x.v]));
  const hrvMap = new Map(hrvDaily.map((x) => [x.d, x.v]));
  const sleepMap = new Map(nights.map((n) => [n.night, n.total]));
  const deepMap = new Map(nights.map((n) => [n.night, n.deep]));
  const master = winDays.map((d) => ({
    d,
    steps: stepDaily.get(d) ?? null,
    active: p.activeByDay.get(d) ?? null,
    exercise: p.exerciseByDay.get(d) ?? null,
    rhr: rhrMap.get(d) ?? null,
    hrv: hrvMap.get(d) ?? null,
    sleep: sleepMap.get(d) ?? null,
    deep: deepMap.get(d) ?? null,
  }));
  const pairsOf = (a: keyof (typeof master)[0], b: keyof (typeof master)[0]) =>
    master.map((r) => [r[a], r[b]]).filter(([x, y]) => x != null && y != null) as [number, number][];
  const corrDefs: [string, string, string, string][] = [
    ['sleep', 'hrv', 'Sleep', 'HRV'],
    ['sleep', 'rhr', 'Sleep', 'Resting HR'],
    ['steps', 'active', 'Steps', 'Active energy'],
    ['exercise', 'hrv', 'Exercise', 'HRV'],
    ['hrv', 'rhr', 'HRV', 'Resting HR'],
    ['steps', 'rhr', 'Steps', 'Resting HR'],
    ['deep', 'hrv', 'Deep sleep', 'HRV'],
    ['steps', 'hrv', 'Steps', 'HRV'],
  ];
  const correlations = corrDefs
    .map(([a, b, la, lb]) => {
      const pr = pairsOf(a as any, b as any);
      const r = corr(pr);
      return { a: la, b: lb, r: isNaN(r) ? 0 : +r.toFixed(3), n: pr.length };
    })
    .filter((c) => c.n >= 15);

  const cmCols = ['steps', 'active', 'exercise', 'rhr', 'hrv', 'sleep', 'deep'] as const;
  const corrMatrix = {
    cols: ['Steps', 'Active', 'Exercise', 'Rest HR', 'HRV', 'Sleep', 'Deep'],
    data: cmCols.map((a) =>
      cmCols.map((b) => {
        if (a === b) return 1;
        const pr = pairsOf(a as any, b as any);
        const r = corr(pr);
        return pr.length >= 15 && !isNaN(r) ? +r.toFixed(2) : null;
      }),
    ),
  };

  // ---------- anomalies ----------
  const rhrValues = rhrDaily.map((x) => x.v);
  const rhrM = mean(rhrValues), rhrS = std(rhrValues);
  const hrvValues = hrvDaily.map((x) => x.v);
  const hrvM = mean(hrvValues), hrvS = std(hrvValues);
  const worst = nights.length ? nights.reduce((a, b) => (a.total < b.total ? a : b)) : null;

  // ---------- population (age/sex aware) ----------
  const vo2 = vo2Sorted.length ? vo2Sorted[vo2Sorted.length - 1].v : NaN;
  const rhrMean = rhrValues.length ? mean(rhrValues) : NaN;
  const hrvMean = hrvValues.length ? mean(hrvValues) : NaN;
  const medSteps = stepSorted.length ? median(stepVals) : NaN;
  const meanSleep = totalArr.length ? mean(totalArr) : NaN;
  const population = buildPopulation(profile, { vo2, rhr: rhrMean, hrv: hrvMean, steps: medSteps, sleep: meanSleep, bmi });

  // ---------- scores ----------
  const weeklyEx = exVals.length ? mean(exVals) * 7 : 0;
  const scores = buildScores({
    stepsMedian: medSteps, weeklyEx, vo2, hrv: hrvMean, rhr: rhrMean,
    sleep: meanSleep, eff: staged.length ? mean(nights.map((n) => n.eff).filter((x) => !isNaN(x))) : 85,
    bedStd: std(bedWrapped), stepStd: std(stepVals), stepMean: mean(stepVals),
    wear: p.hrDays.size && winDays.length ? ([...p.hrDays].filter((d) => d >= windowStart).length / winDays.length) * 100 : 0,
    hrvTrend: (hrvDaily.length ? mean(lastN(hrvDaily, 30)) - mean(firstN(hrvDaily, 30)) : 0),
    rhrTrend: (rhrDaily.length ? mean(lastN(rhrDaily, 30)) - mean(firstN(rhrDaily, 30)) : 0),
    walkSpeed: p.walk.get('walkSpeed') ? p.walk.get('walkSpeed')!.sum / p.walk.get('walkSpeed')!.cnt : 4.5,
    steadiness: p.walk.get('steadiness') ? (p.walk.get('steadiness')!.sum / p.walk.get('steadiness')!.cnt) * 100 : 95,
  });

  // ---------- series for charts ----------
  const series: Record<string, Series> = {
    steps: { dates: winDays, values: stepsFull.map((v) => (v == null ? null : Math.round(v))) },
    active: { dates: winDays, values: activeSeries.map((v) => (v == null ? null : Math.round(v))) },
    restingHr: { dates: rhrDaily.map((x) => x.d), values: rhrDaily.map((x) => +x.v.toFixed(1)) },
    hrv: { dates: hrvDaily.map((x) => x.d), values: hrvDaily.map((x) => +x.v.toFixed(1)) },
    vo2: { dates: vo2Sorted.map((x) => x.d), values: vo2Sorted.map((x) => +x.v.toFixed(1)) },
    sleep: {
      dates: nights.map((n) => n.night),
      values: nights.map((n) => +n.total.toFixed(2)),
      extra: { bed: nights.map((n) => +n.bed.toFixed(2)), wake: nights.map((n) => +n.wake.toFixed(2)) },
    },
  };

  // ---------- inventory + data quality ----------
  const wornInWindow = [...p.hrDays].filter((d) => d >= windowStart).length;
  const confidenceFor = (n: number): Status => (n === 0 ? 'bad' : n < 30 ? 'warn' : 'good');
  const inventory = p.inventoryOrder.map((t) => ({
    type: t.replace('HKQuantityTypeIdentifier', '').replace('HKCategoryTypeIdentifier', ''),
    short: (t.match(/[A-Z][a-z]+/g) ?? []).join(' '),
    count: p.counts[t],
    confidence: confidenceFor(p.counts[t]),
  }));

  const contamNote =
    p.contamination > 0
      ? `${p.contamination} reproductive/manual records found. If these do not match your profile they are likely from a shared device or manual entry and are excluded from health interpretation.`
      : null;

  const sourceCount = Object.keys(p.sources).length;
  const issues = [
    strayCount > 0 && {
      title: 'Stray historical fragments',
      detail: `${strayCount} day(s) of sparse old data separated by a large gap.`,
      handling: `Excluded; analysis window starts ${windowStart} where continuous data begins.`,
    },
    sourceCount > 1 && {
      title: 'Multiple step sources',
      detail: `Steps recorded by ${sourceCount} sources/devices.`,
      handling: 'Per-day max-by-source used to avoid double counting.',
    },
    p.contamination > 0 && {
      title: 'Reproductive / manual data',
      detail: contamNote!,
      handling: 'Excluded from physiological interpretation; flagged in Anomalies.',
    },
    {
      title: 'Watch-off gaps',
      detail: `Heart-rate data present on ${wornInWindow} of ${winDays.length} days.`,
      handling: 'Cardio stats computed on worn days only.',
    },
    weightRecs.length < 5 && {
      title: 'Sparse body data',
      detail: `${weightRecs.length} weight reading(s); no body-fat/lean-mass data.`,
      handling: 'BMI computed if possible; no weight trend.',
    },
  ].filter(Boolean) as DataQualityIssue[];

  return {
    generatedAt: new Date().toISOString(),
    profile,
    dataQuality: {
      totalRecords: p.totalRecords,
      windowStart,
      windowEnd: winDays[winDays.length - 1] ?? windowStart,
      daysSpan: winDays.length,
      coveragePct: winDays.length ? (stepDaily.size / winDays.length) * 100 : 0,
      watchWearPct: winDays.length ? (wornInWindow / winDays.length) * 100 : 0,
      watchWornDays: wornInWindow,
      strayOldDays: strayCount,
      sources: p.sources,
      contaminationRecords: p.contamination,
      contaminationNote: contamNote,
      issues,
    },
    activity: {
      stepsMean: mean(stepVals), stepsMedian: medSteps, stepsStd: std(stepVals),
      stepsMax: maxStep, stepsMaxDate: maxStepDate,
      p75: quantile(stepSorted, 0.75), p90: quantile(stepSorted, 0.9),
      daysOver10k: stepVals.filter((v) => v >= 10000).length,
      daysUnder5k: stepVals.filter((v) => v < 5000).length,
      pctDaysOver10k: stepVals.length ? (stepVals.filter((v) => v >= 10000).length / stepVals.length) * 100 : 0,
      weekdayMean: wd.length ? mean(wd) : 0, weekendMean: we.length ? mean(we) : 0,
      byDow, byMonth,
      longest10kStreak: longestStreak(stepsFull.map((v) => (v ?? 0) >= 10000)),
      longestInactiveStreak: longestStreak(stepsFull.map((v) => v == null || v < 2000)),
      activeEnergyMean: meanActive, exerciseMinMean: exVals.length ? mean(exVals) : 0,
      weeklyExerciseMin: weeklyEx, totalDistanceKm: distTotal, flightsTotal: p.flightsTotal,
    },
    cardio: {
      restingHrMean: rhrMean, restingHrMin: rhrValues.length ? Math.min(...rhrValues) : NaN,
      restingHrMax: rhrValues.length ? Math.max(...rhrValues) : NaN,
      restingHrFirst: rhrDaily.length ? mean(firstN(rhrDaily, 30)) : NaN,
      restingHrLast: rhrDaily.length ? mean(lastN(rhrDaily, 30)) : NaN,
      hrvMean, hrvFirst: hrvDaily.length ? mean(firstN(hrvDaily, 30)) : NaN,
      hrvLast: hrvDaily.length ? mean(lastN(hrvDaily, 30)) : NaN,
      vo2First: vo2Sorted.length ? vo2Sorted[0].v : NaN, vo2Latest: vo2,
      hrAbsMin: isFinite(p.hrMin) ? p.hrMin : NaN, hrAbsMax: isFinite(p.hrMax) ? p.hrMax : NaN,
      hrReadings: p.hrCount, hourlyHr, hrZones,
      walkingHrMean: p.walkingHr.length ? mean(p.walkingHr) : undefined,
    },
    sleep: {
      nNights: nights.length, meanSleepH: meanSleep, medianSleepH: totalArr.length ? median(totalArr) : NaN,
      meanEff: staged.length ? mean(nights.map((n) => n.eff).filter((x) => !isNaN(x))) : NaN,
      pctUnder6h: totalArr.length ? (totalArr.filter((t) => t < 6).length / totalArr.length) * 100 : 0,
      medianBedH: bedWrapped.length ? median(bedWrapped) % 24 : NaN,
      medianWakeH: nights.length ? median(nights.map((n) => n.wake)) : NaN,
      bedStdH: std(bedWrapped),
      deepPct: (staged.reduce((a, n) => a + n.deep, 0) / stageTot) * 100,
      remPct: (staged.reduce((a, n) => a + n.rem, 0) / stageTot) * 100,
      corePct: (staged.reduce((a, n) => a + n.core, 0) / stageTot) * 100,
      weekdaySleep: wdSleep.length ? mean(wdSleep) : NaN, weekendSleep: weSleep.length ? mean(weSleep) : NaN,
      nightsAfter2am: nights.filter((n) => n.bed >= 2 && n.bed <= 11).length,
    },
    body: { weightLatest, weightRecords: weightRecs, heightCm: p.heightCm ?? undefined, bmi, bmiCat },
    workouts: {
      n: wk.length, byType: wkByType, totalMin: wk.reduce((a, w) => a + w.dur, 0),
      perWeek: wk.length / wkSpanWeeks,
    },
    metabolic: { meanActiveKcal: meanActive, meanBasalKcal: meanBasal, meanTdee: meanActive + meanBasal },
    correlations, corrMatrix,
    anomalies: {
      highHrEvents: p.highHr, nightsUnder5h: totalArr.filter((t) => t < 5).length,
      worstSleep: worst ? { date: worst.night, hours: +worst.total.toFixed(2) } : null,
      rhrSpikeDays: rhrDaily.filter((x) => x.v > rhrM + 2 * rhrS).slice(0, 10).map((x) => ({ date: x.d, rhr: +x.v.toFixed(1) })),
      hrvCrashDays: hrvDaily.filter((x) => x.v < hrvM - 2 * hrvS).slice(0, 10).map((x) => ({ date: x.d, hrv: +x.v.toFixed(1) })),
      contamination: p.contamination,
    },
    population, scores,
    extras: {
      spo2: p.spo2Cnt ? { mean: (p.spo2Sum / p.spo2Cnt) * 100, pctUnder95: (p.spo2Under95 / p.spo2Cnt) * 100 } : undefined,
      respRate: p.respCnt ? { mean: p.respSum / p.respCnt } : undefined,
      envAudio: p.envCnt ? { meanDb: p.envSum / p.envCnt, maxDb: p.envMax, pctOver80: (p.envOver80 / p.envCnt) * 100 } : undefined,
      walking: Object.fromEntries([...p.walk].map(([k, v]) => [k, { mean: v.sum / v.cnt, n: v.cnt }])),
      daylightMean: p.daylightByDay.size ? mean([...p.daylightByDay.values()]) : undefined,
      mindful: p.counts['HKCategoryTypeIdentifierMindfulSession'] ?? 0,
    },
    series, inventory,
  };
}

interface DataQualityIssue { title: string; detail: string; handling: string }

// -------- population reference bands --------
function buildPopulation(
  profile: Profile,
  m: { vo2: number; rhr: number; hrv: number; steps: number; sleep: number; bmi?: number },
) {
  const male = profile.sex === 'male';
  const rows: AnalysisResult['population'] = [];
  const push = (metric: string, value: number | string, category: string, status: Status, ref: string) =>
    rows.push({ metric, value, category, status, ref });

  if (!isNaN(m.vo2)) {
    // Cooper/ACSM bands (young adult). Slightly lower thresholds for female.
    const t = male ? [32, 38, 45, 52, 57] : [28, 34, 40, 47, 52];
    const cat =
      m.vo2 < t[0] ? ['Very poor (bottom ~10-15%)', 'bad']
      : m.vo2 < t[1] ? ['Poor (~20th pct)', 'bad']
      : m.vo2 < t[2] ? ['Fair (~40th pct)', 'warn']
      : m.vo2 < t[3] ? ['Good (~65th pct)', 'good']
      : m.vo2 < t[4] ? ['Excellent (~85th pct)', 'good']
      : ['Superior (top ~5%)', 'good'];
    const ageLabel = profile.age ? ` ~age ${profile.age}` : '';
    push('VO₂ max', +m.vo2.toFixed(1), cat[0] as string, cat[1] as Status, `Cooper/ACSM, ${profile.sex}${ageLabel}`);
  }
  if (!isNaN(m.rhr)) {
    const cat = m.rhr < 60 ? ['Excellent (<60)', 'good'] : m.rhr <= 68 ? ['Good (60-68)', 'good'] : m.rhr <= 73 ? ['Average (69-73)', 'neutral'] : m.rhr <= 78 ? ['Below average (74-78)', 'warn'] : ['Poor (>78)', 'bad'];
    push('Resting HR', +m.rhr.toFixed(1), cat[0] as string, cat[1] as Status, 'General adult norms');
  }
  if (!isNaN(m.hrv)) {
    const hrvAgeLabel = profile.age ? `Age ${profile.age} typical` : 'Typical';
    push('HRV (SDNN)', +m.hrv.toFixed(1), m.hrv > 50 ? 'Around/above average' : 'Below average', m.hrv > 50 ? 'good' : 'warn', `${hrvAgeLabel} ~50-70ms`);
  }
  if (!isNaN(m.steps))
    push('Steps (median)', Math.round(m.steps), m.steps >= 10000 ? 'Meets 10k target' : m.steps >= 7000 ? 'Moderately active' : 'Below active guideline', m.steps >= 7000 ? 'good' : m.steps >= 4000 ? 'warn' : 'bad', 'Tudor-Locke norms; 10k target');
  if (!isNaN(m.sleep))
    push('Sleep (mean)', +m.sleep.toFixed(2), m.sleep >= 7 && m.sleep <= 9 ? 'Within 7-9h guideline' : 'Outside 7-9h guideline', m.sleep >= 7 && m.sleep <= 9 ? 'good' : 'warn', 'National Sleep Foundation 7-9h');
  if (m.bmi)
    push('BMI', +m.bmi.toFixed(1), m.bmi < 18.5 ? 'Underweight' : m.bmi < 25 ? 'Healthy' : m.bmi < 30 ? 'Overweight' : 'Obese', m.bmi >= 18.5 && m.bmi < 25 ? 'good' : 'warn', 'WHO 18.5-24.9 healthy');
  return rows;
}

function buildScores(x: {
  stepsMedian: number; weeklyEx: number; vo2: number; hrv: number; rhr: number; sleep: number;
  eff: number; bedStd: number; stepStd: number; stepMean: number; wear: number;
  hrvTrend: number; rhrTrend: number; walkSpeed: number; steadiness: number;
}) {
  const s: Record<string, number> = {};
  const stepScore = clamp((x.stepsMedian / 10000) * 100);
  const exScore = clamp((x.weeklyEx / 150) * 100);
  s['Activity'] = Math.round(clamp(0.6 * stepScore + 0.4 * exScore));
  s['Cardio Fitness'] = Math.round(clamp(((x.vo2 - 25) / (50 - 25)) * 100));
  const hrvS = clamp(((x.hrv - 20) / (80 - 20)) * 100);
  const rhrS = clamp(((80 - x.rhr) / (80 - 50)) * 100);
  s['Recovery'] = Math.round(clamp(0.5 * hrvS + 0.5 * rhrS));
  const durS = clamp(100 - (Math.abs(x.sleep - 7.75) / 2) * 100);
  const consS = clamp(100 - (x.bedStd / 3) * 100);
  s['Sleep'] = Math.round(clamp(0.5 * durS + 0.25 * clamp(x.eff) + 0.25 * consS));
  const cv = x.stepMean ? x.stepStd / x.stepMean : 1;
  s['Consistency'] = Math.round(clamp(0.5 * clamp(100 - cv * 60) + 0.3 * x.wear + 0.2 * consS));
  s['Stress Resilience'] = Math.round(clamp(60 + x.hrvTrend * 1.5 - x.rhrTrend * 2));
  s['Mobility'] = Math.round(clamp(0.6 * clamp(((x.walkSpeed - 2.5) / 3) * 100) + 0.4 * clamp(x.steadiness)));
  const found = ['Activity', 'Cardio Fitness', 'Recovery', 'Sleep', 'Consistency'].map((k) => s[k]);
  s['Longevity'] = Math.round(mean(found));
  s['Overall Health'] = Math.round(mean(Object.values(s)));
  return s;
}

/**
 * Estimates biological age using a multi-factor algorithm:
 * VO2 Max, HRV, Resting HR, Sleep duration, and BMI.
 *
 * Returns:
 *   - bioAge: the estimated biological age in years
 *   - delta: how many years younger (negative) or older (positive) than chronological
 *   - confidence: 'low' | 'medium' | 'high' based on how many factors were available
 *   - factorsUsed: array of factor names used in the calculation
 */
export function estimateBiologicalAge(
  profile: Profile,
  cardio: { restingHrMean: number; hrvMean: number; vo2Latest: number },
  sleep: { meanSleepH: number },
  body: { bmi?: number },
): { bioAge: number; delta: number; confidence: 'low' | 'medium' | 'high'; factorsUsed: string[] } {
  const age = profile.age || 30;
  const male = profile.sex === 'male';
  let delta = 0;
  const factorsUsed: string[] = [];

  // VO2 Max: strongest predictor. Age-sex reference norms (ACSM).
  if (!isNaN(cardio.vo2Latest) && cardio.vo2Latest > 0) {
    // Age-sex reference midpoint for a "typical" adult
    const vo2Ref = male
      ? Math.max(32, 52 - (age - 25) * 0.4)
      : Math.max(28, 46 - (age - 25) * 0.35);
    // Each 5 mL/kg/min above/below ref = approximately 1 year younger/older
    const vo2Delta = ((cardio.vo2Latest - vo2Ref) / 5) * -1.0;
    delta += clamp(vo2Delta, -4, 4);
    factorsUsed.push('VO\u2082 Max');
  }

  // HRV: every 10ms above 50ms = 0.5 years younger
  if (!isNaN(cardio.hrvMean) && cardio.hrvMean > 0) {
    const hrvDelta = ((cardio.hrvMean - 50) / 10) * -0.5;
    delta += clamp(hrvDelta, -2, 2);
    factorsUsed.push('HRV');
  }

  // RHR: excellent < 60 = -1y, poor > 78 = +1.5y
  if (!isNaN(cardio.restingHrMean) && cardio.restingHrMean > 0) {
    const rhrDelta =
      cardio.restingHrMean < 60 ? -1.0
      : cardio.restingHrMean <= 68 ? -0.5
      : cardio.restingHrMean <= 73 ? 0
      : cardio.restingHrMean <= 78 ? 0.75
      : 1.5;
    delta += rhrDelta;
    factorsUsed.push('Resting HR');
  }

  // Sleep: 7-9h optimal = 0 delta. Each 30min outside = +0.5y
  if (!isNaN(sleep.meanSleepH) && sleep.meanSleepH > 0) {
    const deviation = Math.max(0, Math.abs(sleep.meanSleepH - 8) - 0.5);
    const sleepDelta = (deviation / 0.5) * 0.5;
    delta += clamp(sleepDelta, 0, 2);
    factorsUsed.push('Sleep Duration');
  }

  // BMI: Healthy (18.5-24.9) = -0.5y, Obese (>30) = +1.5y
  if (body.bmi && !isNaN(body.bmi)) {
    const bmiDelta =
      body.bmi < 18.5 ? 0.5
      : body.bmi < 25 ? -0.5
      : body.bmi < 30 ? 0.5
      : 1.5;
    delta += bmiDelta;
    factorsUsed.push('BMI');
  }

  // Clamp total delta to a physiologically defensible range
  delta = clamp(delta, -8, 5);

  const confidence: 'low' | 'medium' | 'high' =
    factorsUsed.length >= 3 ? 'high' : factorsUsed.length === 2 ? 'medium' : 'low';

  const bioAge = Math.max(18, Math.round((age + delta) * 10) / 10);

  return { bioAge, delta: Math.round(delta * 10) / 10, confidence, factorsUsed };
}
