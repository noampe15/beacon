import { useState } from "react"
import { QUEUE_AI_STATUSES } from "../mspDashboard"

const SEGMENTS = [
  { key: "AI fixing", fill: "#8b7dff", legend: "bg-[#8b7dff]" },
  { key: "Waiting on human", fill: "#f3d19e", legend: "bg-[#f3d19e]" },
  { key: "Blocked", fill: "#334155", legend: "bg-slate-700" },
]

export default function StackedBarChart({ buckets, onSegmentClick }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(
    4,
    ...buckets.map((b) => QUEUE_AI_STATUSES.reduce((sum, k) => sum + (b[k] ?? 0), 0)),
  )
  const ticks = Array.from({ length: max + 1 }, (_, i) => i)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="mb-3 flex flex-wrap gap-3 text-[12px] text-slate-600">
        {SEGMENTS.map((seg) => (
          <li key={seg.key} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-sm ${seg.legend}`} aria-hidden="true" />
            {seg.key}
          </li>
        ))}
      </ul>
      <div className="relative flex min-h-[180px] flex-1">
        <div className="flex w-6 flex-col-reverse justify-between pr-1 text-[10px] text-slate-500" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col-reverse justify-between" aria-hidden="true">
            {ticks.map((t) => (
              <div key={t} className="border-t border-slate-100" />
            ))}
          </div>
          <div className="relative flex h-full items-end justify-around gap-3 px-2 pb-6 pt-5">
            {buckets.map((bucket) => {
              const total = QUEUE_AI_STATUSES.reduce((sum, k) => sum + (bucket[k] ?? 0), 0)
              return (
                <div key={bucket.label} className="flex h-full w-full max-w-[72px] flex-col items-center justify-end">
                  <span className="mb-1 text-[11px] font-semibold text-slate-700">{total}</span>
                  <div className="flex h-full w-10 flex-col-reverse overflow-hidden rounded-t-md bg-slate-100">
                    {SEGMENTS.map((seg) => {
                      const n = bucket[seg.key] ?? 0
                      if (!n) return null
                      const pct = max ? (n / max) * 100 : 0
                      const active = hover?.label === bucket.label && hover?.status === seg.key
                      return (
                        <button
                          key={seg.key}
                          type="button"
                          aria-label={`${n} ${seg.key} in ${bucket.label}`}
                          onMouseEnter={() => setHover({ label: bucket.label, status: seg.key, n })}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => setHover({ label: bucket.label, status: seg.key, n })}
                          onBlur={() => setHover(null)}
                          onClick={() => onSegmentClick?.({ age: bucket.label, status: seg.key })}
                          className="w-full outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] focus-visible:ring-offset-1"
                          style={{ height: `${pct}%`, background: seg.fill, opacity: active ? 0.85 : 1 }}
                        />
                      )
                    })}
                  </div>
                  <span className="mt-1 text-center text-[11px] text-slate-600">{bucket.label}</span>
                </div>
              )
            })}
          </div>
          {hover && (
            <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-700 shadow">
              <span className="font-semibold text-slate-900">{hover.n}</span> {hover.status} · {hover.label}
            </div>
          )}
        </div>
      </div>
      <table className="sr-only">
        <caption>Open issues by wait age and AI status</caption>
        <thead>
          <tr>
            <th>Age</th>
            {SEGMENTS.map((s) => (
              <th key={s.key}>{s.key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => (
            <tr key={bucket.label}>
              <td>{bucket.label}</td>
              {SEGMENTS.map((s) => (
                <td key={s.key}>{bucket[s.key] ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
