import type { Status } from '../types/health';

export const n0 = (v: number | null | undefined): string =>
  v == null || isNaN(v) ? '--' : Math.round(v).toLocaleString();
export const n1 = (v: number | null | undefined): string =>
  v == null || isNaN(v) ? '--' : v.toFixed(1);
export const pct = (v: number | null | undefined): string =>
  v == null || isNaN(v) ? '--' : `${Math.round(v)}%`;

/** decimal clock hour -> "5:32 AM" */
export function clock(h: number | null | undefined): string {
  if (h == null || isNaN(h)) return '--';
  const hh = ((Math.floor(h) % 24) + 24) % 24;
  const mm = Math.round((h - Math.floor(h)) * 60);
  const ampm = hh < 12 ? 'AM' : 'PM';
  const disp = hh % 12 === 0 ? 12 : hh % 12;
  return `${disp}:${String(mm).padStart(2, '0')} ${ampm}`;
}

export const fileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const statusColor = (s: Status): string =>
  s === 'good' ? 'text-good' : s === 'warn' ? 'text-warn' : s === 'bad' ? 'text-bad' : 'text-muted';

export const scoreStatus = (v: number): Status => (v >= 70 ? 'good' : v >= 45 ? 'warn' : 'bad');

export const monthLabel = (key: string): string => {
  const [y, m] = key.split('-');
  return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1]} '${y.slice(2)}`;
};

export const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
