import { useMemo } from "react"

const colors = {
  Critical: "#e11d48",
  High: "#f97316",
  Medium: "#ca8a04",
  Low: "#a3a31c",
}

export default function InfrastructureDeficit({ rows }) {
  const max = useMemo(
    () => Math.max(...rows.map((r) => Object.values(r.segments).reduce((a, b) => a + b, 0))),
    [rows],
  )

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h2 className="mb-5 text-[16px] font-semibold text-slate-900">Infrastructure Deficit Distribution</h2>
      <ul className="space-y-4">
        {rows.map((row) => (
          <li
            key={row.name}
            className="grid grid-cols-[110px_1fr_88px] items-center gap-3 sm:grid-cols-[140px_1fr_96px]"
          >
            <p className="truncate text-[13px] text-slate-600">{row.name}</p>
            <div className="min-w-0">
              <div
                className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                style={{ width: `${55 + (row.count / max) * 45}%` }}
              >
                <div className="flex h-full w-full">
                  {Object.entries(row.segments).map(([key, value]) => (
                    <div
                      key={key}
                      title={`${key}: ${value}`}
                      className="h-full"
                      style={{ flexGrow: value, flexBasis: 0, background: colors[key] }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-right text-[12px] text-slate-400">{row.count} resources</p>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-slate-500">
        {Object.entries(colors).map(([key, color]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {key}
          </span>
        ))}
      </div>
    </section>
  )
}
