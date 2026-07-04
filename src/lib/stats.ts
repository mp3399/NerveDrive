/** Small, dependency-free statistics helpers. */

export const mean = (a: number[]): number => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

export const median = (a: number[]): number => quantile([...a].sort((x, y) => x - y), 0.5);

export function std(a: number[]): number {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
}

/** Pearson correlation over paired, non-null values. */
export function corr(pairs: [number, number][]): number {
  const n = pairs.length;
  if (n < 3) return NaN;
  const ax = mean(pairs.map((p) => p[0]));
  const ay = mean(pairs.map((p) => p[1]));
  let num = 0,
    dx = 0,
    dy = 0;
  for (const [x, y] of pairs) {
    num += (x - ax) * (y - ay);
    dx += (x - ax) ** 2;
    dy += (y - ay) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : NaN;
}

export function movingAvg(arr: (number | null)[], w: number): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < arr.length; i++) {
    let s = 0,
      c = 0;
    for (let j = Math.max(0, i - w + 1); j <= i; j++) {
      const v = arr[j];
      if (v != null) {
        s += v;
        c++;
      }
    }
    out.push(c ? s / c : null);
  }
  return out;
}

export function longestStreak(mask: boolean[]): number {
  let best = 0,
    cur = 0;
  for (const m of mask) {
    cur = m ? cur + 1 : 0;
    if (cur > best) best = cur;
  }
  return best;
}

export const clamp = (x: number, lo = 0, hi = 100): number => Math.max(lo, Math.min(hi, x));

/** All calendar dates (YYYY-MM-DD) between two dates inclusive. */
export function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T00:00:00Z');
  while (d <= e) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}
