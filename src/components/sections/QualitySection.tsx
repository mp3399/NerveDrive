import { useStore } from '../../store/useStore';
import { n0 } from '../../lib/format';

export function QualitySection() {
  const r = useStore((s) => s.result!);
  const dq = r.dataQuality;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">Data Quality Audit</h1>
        <p className="text-sm text-muted">Verification of trusted, adjusted, and filtered biometric data points before calculation.</p>
      </div>

      {/* KPI stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card overflow-hidden min-w-0 p-5 border border-line/60 bg-surface/30">
          <span className="text-[10px] text-faint uppercase font-semibold">Total Records</span>
          <div className="text-lg lg:text-xl font-bold font-grotesk text-ink mt-1.5 tabular-nums">{n0(dq.totalRecords)}</div>
          <span className="text-[10px] text-muted block mt-0.5">Biometric logs parsed</span>
        </div>

        <div className="card overflow-hidden min-w-0 p-5 border border-line/60 bg-surface/30">
          <span className="text-[10px] text-faint uppercase font-semibold">Watch Adherence</span>
          <div className="text-lg lg:text-xl font-bold font-grotesk text-ink mt-1.5 tabular-nums">{Math.round(dq.watchWearPct)}%</div>
          <span className="text-[10px] text-muted block mt-0.5">{dq.watchWornDays} active watch days</span>
        </div>

        <div className="card overflow-hidden min-w-0 p-5 border border-line/60 bg-surface/30">
          <span className="text-[10px] text-faint uppercase font-semibold">Analysis Window</span>
          <div className="text-lg lg:text-xl font-bold font-grotesk text-ink mt-1.5 tabular-nums">{dq.daysSpan} days</div>
          <span className="text-[10px] text-muted block mt-0.5 truncate">{dq.windowStart} → {dq.windowEnd}</span>
        </div>

        <div className="card overflow-hidden min-w-0 p-5 border border-line/60 bg-surface/30">
          <span className="text-[10px] text-faint uppercase font-semibold">Contamination Index</span>
          <div className="text-lg lg:text-xl font-bold font-grotesk mt-1.5 text-ink tabular-nums">{dq.contaminationRecords}</div>
          <span className="text-[10px] text-muted block mt-0.5">Shared device overlaps filtered</span>
        </div>
      </div>

      {/* Issues Table */}
      <div className="card p-6 border border-line/60 bg-surface/30 space-y-4">
        <h3 className="font-grotesk font-semibold text-base text-ink">Detected Integrity Flags</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-line text-faint uppercase tracking-wider">
                <th className="pb-2.5 font-semibold">Issue</th>
                <th className="pb-2.5 font-semibold">Detail</th>
                <th className="pb-2.5 font-semibold">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/30 text-muted">
              {dq.issues.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-faint">No flags or issues identified. Data integrity is optimal.</td>
                </tr>
              ) : (
                dq.issues.map((issue) => (
                  <tr key={issue.title} className="hover:bg-surface-2/20">
                    <td className="py-3 font-semibold text-ink">{issue.title}</td>
                    <td className="py-3">{issue.detail}</td>
                    <td className="py-3 text-accent font-semibold">{issue.handling}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Inventory Table */}
      <div className="card p-6 border border-line/60 bg-surface/30 space-y-4">
        <h3 className="font-grotesk font-semibold text-base text-ink">Biological Signal Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-line text-faint uppercase tracking-wider">
                <th className="pb-2.5 font-semibold">Biomarker Signal</th>
                <th className="pb-2.5 font-semibold text-right">Parsed Log Records</th>
                <th className="pb-2.5 font-semibold text-right">Confidence Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/30 text-muted">
              {r.inventory.slice(0, 12).map((item) => (
                <tr key={item.type} className="hover:bg-surface-2/20">
                  <td className="py-2.5 font-semibold text-ink">{item.short || item.type}</td>
                  <td className="py-2.5 text-right font-grotesk">{n0(item.count)}</td>
                  <td className="py-2.5 text-right">
                    <span className={`inline-block text-[9px] font-bold border px-2 py-0.5 rounded ${
                      item.confidence === 'good' ? 'bg-good/10 text-good border-good/20' : 'bg-warn/10 text-warn border-warn/20'
                    }`}>
                      {item.confidence.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-faint leading-relaxed space-y-1">
        <p>
          Data sources parsed: {Object.keys(dq.sources).join(', ') || 'unknown'}.
        </p>
        <p>
          NerveDrive operates 100% locally in your browser. All calculations, graphs, and tables are computed on-device using streaming decoders and JSZip structures.
        </p>
      </div>
    </div>
  );
}
