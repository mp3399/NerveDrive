/** Export engine: JSON, CSV, Markdown, PDF. Chart PNG/SVG handled by ECharts instances. */
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import type { AnalysisResult } from '../types/health';
import { n0, n1, clock } from './format';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportJSON(r: AnalysisResult) {
  download(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }), 'nervedrive-analysis.json');
}

export function exportCSV(r: AnalysisResult) {
  const dates = r.series.steps.dates;
  const map = (key: keyof typeof r.series) => {
    const s = r.series[key];
    const m = new Map(s.dates.map((d, i) => [d, s.values[i]]));
    return (d: string) => m.get(d) ?? '';
  };
  const steps = map('steps'), active = map('active'), rhr = map('restingHr'), hrv = map('hrv'), sleep = map('sleep');
  const rows = dates.map((d) => ({ date: d, steps: steps(d), active_kcal: active(d), resting_hr: rhr(d), hrv: hrv(d), sleep_h: sleep(d) }));
  download(new Blob([Papa.unparse(rows)], { type: 'text/csv' }), 'nervedrive-daily.csv');
}

export function buildMarkdown(r: AnalysisResult): string {
  const a = r.activity, c = r.cardio, s = r.sleep, dq = r.dataQuality;
  const scoreLines = Object.entries(r.scores).map(([k, v]) => `| ${k} | ${v}/100 |`).join('\n');
  const popLines = r.population.map((p) => `| ${p.metric} | ${p.value} | ${p.category} |`).join('\n');
  const corrLines = r.correlations.map((cc) => `| ${cc.a} ↔ ${cc.b} | ${cc.r} | ${cc.n} |`).join('\n');
  const ageStr = r.profile.age ? `${r.profile.age}y ` : '';
  const sexStr = r.profile.sex ? `${r.profile.sex.charAt(0).toUpperCase() + r.profile.sex.slice(1)}` : '';
  const nameStr = r.profile.name ? `${r.profile.name} (${ageStr}${sexStr})` : `${ageStr}${sexStr}`;
  return `# NerveDrive Health Intelligence Report

_Generated ${new Date(r.generatedAt).toLocaleString()} · Profile: ${nameStr}_
_Window: ${dq.windowStart} → ${dq.windowEnd} (${dq.daysSpan} days) · Watch wear ${Math.round(dq.watchWearPct)}%_

## Dashboard Scores
| Dimension | Score |
|---|---|
${scoreLines}

## Activity
- Steps median/mean: ${n0(a.stepsMedian)} / ${n0(a.stepsMean)}
- Days ≥10k: ${a.daysOver10k} (${Math.round(a.pctDaysOver10k)}%)
- Weekday vs weekend: ${n0(a.weekdayMean)} / ${n0(a.weekendMean)}
- Exercise/week: ${n0(a.weeklyExerciseMin)} min · Total distance: ${n0(a.totalDistanceKm)} km

## Cardiovascular
- Resting HR: mean ${n1(c.restingHrMean)} (first ${n1(c.restingHrFirst)} → last ${n1(c.restingHrLast)})
- HRV: mean ${n1(c.hrvMean)} (first ${n1(c.hrvFirst)} → last ${n1(c.hrvLast)})
- VO₂ max: ${n1(c.vo2First)} → ${n1(c.vo2Latest)}

## Sleep
- Nocturnal: mean ${n1(s.meanSleepH)}h / median ${n1(s.medianSleepH)}h · efficiency ${Math.round(s.meanEff)}%
- Median bedtime/wake: ${clock(s.medianBedH)} / ${clock(s.medianWakeH)}
- Nights <6h: ${Math.round(s.pctUnder6h)}% · Deep/REM/Core: ${Math.round(s.deepPct)}/${Math.round(s.remPct)}/${Math.round(s.corePct)}%

## Population Comparison
| Metric | You | Where you sit |
|---|---|---|
${popLines}

## Correlations
| Relationship | r | n |
|---|---|---|
${corrLines}

## Data Quality
${dq.issues.map((i) => `- **${i.title}:** ${i.detail} _(${i.handling})_`).join('\n')}

---
_NerveDrive · analysis runs entirely in your browser · not a medical diagnosis._
`;
}

export function exportMarkdown(r: AnalysisResult) {
  download(new Blob([buildMarkdown(r)], { type: 'text/markdown' }), 'nervedrive-report.md');
}

export function exportPDF(r: AnalysisResult) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 56;
  const line = (t: string, size = 11, bold = false, color = '#111') => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(t, 48, y);
    y += size + 8;
    if (y > 780) { doc.addPage(); y = 56; }
  };
  doc.setFillColor('#0a0b0d'); doc.rect(0, 0, W, 90, 'F');
  doc.setTextColor('#10b981'); doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
  doc.text('NerveDrive', 48, 50);
  doc.setTextColor('#fff'); doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text('Apple Health Intelligence Report', 48, 70);
  y = 120;
  const ageStr = r.profile.age ? `${r.profile.age}y ` : '';
  const sexStr = r.profile.sex ? `${r.profile.sex.charAt(0).toUpperCase() + r.profile.sex.slice(1)}` : '';
  const nameStr = r.profile.name ? `${r.profile.name} (${ageStr}${sexStr})` : `${ageStr}${sexStr}`;
  line(`Profile: ${nameStr}  ·  ${r.dataQuality.windowStart} → ${r.dataQuality.windowEnd} (${r.dataQuality.daysSpan} days)`, 10, false, '#555');
  y += 6;
  line('Dashboard Scores', 15, true);
  Object.entries(r.scores).forEach(([k, v]) => line(`${k}:  ${v}/100`, 11, false, v >= 70 ? '#10b981' : v >= 45 ? '#f59e0b' : '#ef4444'));
  y += 6; line('Headline Metrics', 15, true);
  const c = r.cardio, s = r.sleep, a = r.activity;
  [
    `VO2 max: ${n1(c.vo2Latest)}   Resting HR: ${n1(c.restingHrMean)} (${n1(c.restingHrFirst)} to ${n1(c.restingHrLast)})`,
    `HRV: ${n1(c.hrvMean)} (${n1(c.hrvFirst)} to ${n1(c.hrvLast)})`,
    `Steps median: ${n0(a.stepsMedian)}   Days >=10k: ${a.daysOver10k} (${Math.round(a.pctDaysOver10k)}%)`,
    `Sleep: ${n1(s.meanSleepH)}h  ·  bedtime ${clock(s.medianBedH)}  ·  nights <6h ${Math.round(s.pctUnder6h)}%`,
  ].forEach((t) => line(t));
  y += 6; line('Population Comparison', 15, true);
  r.population.forEach((p) => line(`${p.metric}: ${p.value} — ${p.category}`, 11, false, '#333'));
  y += 10; line('Generated in-browser by NerveDrive · not a medical diagnosis.', 9, false, '#888');
  doc.save('nervedrive-report.pdf');
}
