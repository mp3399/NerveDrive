export function DataTable({ head, rows }: { head: string[]; rows: (string | number | JSX.Element)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>{head.map((h, i) => (
            <th key={i} className={`border-b border-line px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-faint ${i > 0 ? 'text-right' : ''}`}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-surface-2/60">
              {r.map((c, j) => (
                <td key={j} className={`border-b border-line/60 px-3 py-2.5 ${j > 0 ? 'text-right tabular-nums' : 'font-medium'}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
