import { useMemo } from "react"
import { ShieldAlert, Shield, ShieldCheck } from "lucide-react"
import { healthForRange, mspTenants } from "../mspDashboard"
import AnnotationPin from "./AnnotationPin"
import MetricDelta from "./MetricDelta"

const buckets = [
  { key: "secure", label: "Secure", color: "#16a34a", tone: "text-emerald-800", bg: "bg-emerald-50", Icon: ShieldCheck },
  { key: "warning", label: "SLA Warnings", color: "#ea580c", tone: "text-amber-800", bg: "bg-orange-50", Icon: Shield },
  { key: "critical", label: "Critical Risk", color: "#e11d48", tone: "text-rose-800", bg: "bg-rose-50", Icon: ShieldAlert },
]

function Donut({ counts }) {
  const total = Math.max(1, counts.secure + counts.warning + counts.critical)
  const size = 128
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0
  const slices = buckets.map((bucket) => {
    const value = counts[bucket.key]
    const len = (value / total) * c
    const slice = { ...bucket, value, dash: `${len} ${c - len}`, offset }
    offset += len
    return slice
  })

  return (
    <div className="relative mx-auto h-32 w-32">
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${total} tenants in the managed estate`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        {slices.map((slice) => (
          <circle
            key={slice.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={slice.color}
            strokeWidth={stroke}
            strokeDasharray={slice.dash}
            strokeDashoffset={-slice.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[22px] font-semibold leading-none text-slate-900">{total}</p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">Tenants</p>
      </div>
    </div>
  )
}

export default function PortfolioHealth({ range, pmNotes, onOpenNote, onOpenStatus, onOpenTenant }) {
  const health = healthForRange(range)
  const counts = health.counts
  const deltas = health.deltas
  const byHealth = useMemo(() => {
    const groups = { secure: [], warning: [], critical: [] }
    for (const tenant of mspTenants) {
      if (groups[tenant.health]) groups[tenant.health].push(tenant)
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.name.localeCompare(b.name))
    }
    return groups
  }, [])

  return (
    <section
      data-pin="health"
      className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      {pmNotes && <AnnotationPin n={5} noteId={5} onOpen={onOpenNote} className="absolute right-3 top-3" />}
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-slate-900">Portfolio health distribution</h2>
        <p className="mt-0.5 text-[12px] text-slate-500">Tenants aggregated by systemic exposure</p>
      </div>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <Donut counts={counts} />
        <ul className="grid w-full flex-1 gap-2">
          {buckets.map((bucket) => {
            const tenants = byHealth[bucket.key] ?? []
            const twoCol = tenants.length > 6
            const popupId = `health-tenants-${bucket.key}`
            return (
              <li key={bucket.key} className="group relative z-0 hover:z-[90] focus-within:z-[90]">
                <button
                  type="button"
                  onClick={() => onOpenStatus?.(bucket.key)}
                  aria-label={`Open Tenants filtered to ${bucket.label}`}
                  aria-controls={popupId}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_2.75rem_minmax(7.5rem,1fr)] items-center gap-x-2 rounded-xl px-3 py-2.5 text-left outline-none hover:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${bucket.bg}`}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 text-[13px] font-medium text-slate-700">
                    <bucket.Icon className="h-3.5 w-3.5 shrink-0" style={{ color: bucket.color }} aria-hidden="true" />
                    <span className="truncate">{bucket.label}</span>
                  </span>
                  <span className={`text-right text-[18px] font-semibold leading-none tabular-nums ${bucket.tone}`}>
                    {counts[bucket.key]}
                  </span>
                  <span className="min-w-0 justify-self-end">
                    {deltas[bucket.key] !== 0 ? (
                      <MetricDelta pts={deltas[bucket.key]} label={health.priorLabel} />
                    ) : (
                      <span className="text-[12px] font-medium text-slate-500">unchanged {health.priorLabel}</span>
                    )}
                  </span>
                </button>
                <div
                  id={popupId}
                  role="region"
                  aria-label={`${bucket.label} tenants`}
                  className="pointer-events-none invisible absolute left-0 right-0 top-full z-[80] pt-1 opacity-0 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                >
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-[11px] font-semibold tracking-wide text-slate-400">
                      {tenants.length} {tenants.length === 1 ? "tenant" : "tenants"} · {bucket.label}
                    </p>
                    <ul className={`mt-2 max-h-56 overflow-auto ${twoCol ? "grid grid-cols-2 gap-x-3 gap-y-1.5" : "space-y-1"}`}>
                      {tenants.map((tenant) => (
                        <li key={tenant.id}>
                          <button
                            type="button"
                            onClick={() => onOpenTenant?.(tenant.id)}
                            aria-label={`Open ${tenant.name} summary`}
                            className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff] text-[8px] font-semibold text-[#6d5cff]">
                              {tenant.initials}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[12.5px] font-medium text-[#4c3fd4]">{tenant.name}</span>
                              <span className="block truncate text-[11px] text-slate-400">
                                {tenant.industry}
                                {tenant.openIssues?.length ? ` · ${tenant.openIssues.length} open` : ""}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
