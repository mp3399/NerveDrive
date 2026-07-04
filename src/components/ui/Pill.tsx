import type { Status } from '../../types/health';
const MAP: Record<Status, string> = {
  good: 'bg-good/15 text-good',
  warn: 'bg-warn/15 text-warn',
  bad: 'bg-bad/15 text-bad',
  neutral: 'bg-accent/10 text-muted',
};
export function Pill({ status = 'neutral', children }: { status?: Status; children: React.ReactNode }) {
  return (
    <span className={`pill ${MAP[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} aria-hidden />
      {children}
    </span>
  );
}
