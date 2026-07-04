import type { Status } from '../../types/health';
import { Pill } from './Pill';

export function KpiCard({
  label, value, unit, sub, status,
}: { label: string; value: string; unit?: string; sub?: string; status?: Status }) {
  return (
    <div className="card flex flex-col gap-1 p-4 sm:p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="stat-num text-3xl">{value}</span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>
      {status ? <div className="mt-1"><Pill status={status}>{sub}</Pill></div> : sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}
