import { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, Download, RefreshCw } from "lucide-react"
import { envRiskSeverity, rangeOptions } from "../data"
import TenantSelector from "./TenantSelector"
import { EnvRiskBadge } from "./Badges"

function NotificationsBell({ items, onOpenNotification }) {
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState(() => new Set())
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const unread = items.filter((item) => !readIds.has(item.id)).length

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border ${
          open
            ? "border-[#6d5cff]/40 bg-[#f3f1ff] text-[#6d5cff]"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
        }`}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <p className="text-[13px] font-semibold text-slate-800">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => setReadIds(new Set(items.map((item) => item.id)))}
                className="text-[12px] font-medium text-[#6d5cff] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-[13px] text-slate-400">No notifications</p>
            )}
            {items.map((item) => {
              const unreadItem = !readIds.has(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setReadIds((prev) => new Set(prev).add(item.id))
                    onOpenNotification?.(item)
                    setOpen(false)
                  }}
                  className={`flex w-full gap-3 px-3 py-2.5 text-left hover:bg-slate-50 ${
                    unreadItem ? "bg-[#faf9ff]" : ""
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      item.priority === "Critical" ? "bg-rose-500" : "bg-amber-400"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-slate-800">{item.title}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-slate-500">{item.body}</span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-[11px] text-slate-400">{item.time}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header({
  tenants,
  tenantId,
  onTenantChange,
  envRisk,
  envRiskByTenant,
  range,
  setRange,
  onRefresh,
  refreshing,
  onExport,
  notifications,
  onOpenNotification,
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6d5cff]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M12 4.5L19 8.5V15.5L12 19.5L5 15.5V8.5L12 4.5Z"
              stroke="white"
              strokeWidth="1.8"
            />
            <circle cx="12" cy="12" r="2.2" fill="white" />
          </svg>
        </div>
        <span className="text-[18px] font-semibold tracking-tight text-slate-900">Beacon</span>
        <TenantSelector
          tenants={tenants}
          value={tenantId}
          onChange={onTenantChange}
          envRiskByTenant={envRiskByTenant}
        />
        <EnvRiskBadge
          severity={envRiskSeverity[envRisk] ?? "None"}
          label={envRisk}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <label className="relative">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-9 appearance-none rounded-full border border-slate-200 bg-white py-0 pl-3 pr-8 text-[13px] font-medium text-slate-600 outline-none"
          >
            {rangeOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </label>
        <NotificationsBell items={notifications} onOpenNotification={onOpenNotification} />
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-slate-950 px-3.5 text-[13px] font-semibold text-white"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6d5cff] text-[12px] font-semibold text-white">
          MR
        </div>
      </div>
    </header>
  )
}
