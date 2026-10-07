import { useEffect, useRef, useState } from "react"
import { MoreVertical, ShieldAlert, Shield, Undo2, Ban } from "lucide-react"
import { SeverityBadge } from "./Badges"
import AssignMenu from "./AssignMenu"

function formatCountdown(ms) {
  if (ms <= 0) return "SLA breached"
  const total = Math.round(ms / 60000)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h <= 0) return `RTO breach in ${m}m`
  return `RTO breach in ${h}h ${String(m).padStart(2, "0")}m`
}

function slaTone(ms) {
  if (ms <= 60 * 60 * 1000) return "text-rose-800 bg-rose-50 border-rose-200"
  if (ms <= 2 * 60 * 60 * 1000) return "text-amber-800 bg-amber-50 border-amber-200"
  return "text-slate-700 bg-slate-50 border-slate-200"
}

const AI_STATUS_TONE = {
  "Waiting on human": "bg-amber-50 text-amber-900",
  "AI fixing": "bg-[#f3f1ff] text-[#5b4cf0]",
  Blocked: "bg-slate-200 text-slate-800",
}

export default function QueueCard({
  item,
  selected,
  bulkMode,
  checked,
  onCheck,
  onReview,
  onAssign,
  onSnooze,
  onDismiss,
  onRequestAccess,
  now,
  scope = "global",
  compact = false,
}) {
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)
  const remain = item.breachAt - now
  const extra = Math.max(0, (item.tenantCount ?? 0) - (item.tenantNames ?? []).length)
  const dense = compact && scope !== "tenant"

  useEffect(() => {
    if (!menu) return
    function onDoc(e) {
      if (menuRef.current?.contains(e.target)) return
      if (e.target.closest?.('[aria-label="Assign to"]')) return
      setMenu(false)
    }
    function onKey(e) {
      if (e.key === "Escape") setMenu(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [menu])

  return (
    <li
      className={`w-full rounded-xl border transition hover:border-slate-300 ${
        dense ? "flex h-full min-h-0 flex-col p-2.5" : "p-3"
      } ${selected ? "border-[#6d5cff]/40 bg-[#f7f6ff]" : "border-slate-200 bg-white"}`}
    >
      <div className={`flex min-w-0 ${dense ? "h-full min-h-0 flex-1 flex-col" : "items-start gap-2"}`}>
        {bulkMode && (
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-[#6d5cff]"
            checked={checked}
            onChange={() => onCheck(item.id)}
            aria-label={`Select ${item.issue}`}
          />
        )}
        <div className={`min-w-0 flex-1 ${dense ? "flex min-h-0 flex-1 flex-col" : ""}`}>
          <div className="flex items-start justify-between gap-2">
            <p className={`min-w-0 font-semibold text-slate-900 ${dense ? "truncate text-[13px] leading-tight" : "text-[13.5px] leading-snug"}`}>
              {item.issue}
            </p>
            <span className="shrink-0">
              <SeverityBadge
                severity={item.priority}
                label={`${item.score} ${item.priority}`}
                icon={item.priority === "Critical" ? ShieldAlert : Shield}
              />
            </span>
          </div>
          {scope !== "tenant" && (
            <p className={`text-[11px] font-medium text-[#5b4cf0] ${dense ? "mt-0.5 truncate" : "mt-2"}`}>
              {dense ? item.reason : `AI Escalation Reason · ${item.reason}`}
            </p>
          )}
          <div className={`flex flex-wrap gap-1 ${dense ? "mt-1" : "mt-2 gap-1.5"}`}>
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${slaTone(remain)}`}>
              {formatCountdown(remain)}
            </span>
            {!dense && item.aiStatus && (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${AI_STATUS_TONE[item.aiStatus] ?? "bg-slate-100 text-slate-700"}`}>
                {item.aiStatus}
              </span>
            )}
            {scope === "tenant" && item.reason && (
              <span className="inline-flex rounded-full bg-[#f3f1ff] px-2 py-0.5 text-[11px] font-medium text-[#5b4cf0]">
                {item.reason}
              </span>
            )}
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              {item.confidence}% confidence
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                item.reversible ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
              }`}
            >
              {item.reversible ? <Undo2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
              {item.reversible ? "Reversible" : "Irreversible"}
            </span>
          </div>
          {scope !== "tenant" && (
            <p className={`truncate text-[12px] text-slate-600 ${dense ? "mt-1" : "mt-2"}`}>
              Affects {item.tenantCount} {item.tenantCount === 1 ? "tenant" : "tenants"}
              {dense ? "" : `: ${item.tenantNames.join(", ")}${extra > 0 ? ` +${extra} more` : ""}`}
            </p>
          )}
          <p className={`truncate text-[12px] text-slate-700 ${dense ? "mt-0.5" : "mt-1"}`}>
            <span className="font-medium text-slate-600">AI would: </span>
            {item.fixSummary}
          </p>
          <div className={`flex w-full items-center justify-between gap-2 ${dense ? "mt-auto pt-2" : "mt-3"}`}>
            {item.owner ? (
              <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-[11px] text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff] text-[9px] font-semibold text-[#6d5cff]">
                  {item.owner.initials}
                </span>
                <span className="truncate">{item.owner.name}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-600">Unassigned</span>
            )}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => (item.cta === "request-access" ? onRequestAccess?.(item) : onReview(item))}
                className={`inline-flex items-center justify-center rounded-lg bg-[#6d5cff] px-3 text-[12px] font-semibold text-white outline-none hover:bg-[#5b4cf0] focus-visible:ring-2 focus-visible:ring-[#6d5cff] focus-visible:ring-offset-2 ${
                  dense ? "h-7" : "h-8"
                }`}
              >
                {item.cta === "request-access" ? "Request access" : "Review Global Fix"}
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label={`More actions for ${item.issue}`}
                  aria-expanded={menu}
                  onClick={() => setMenu((v) => !v)}
                  className={`inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                    dense ? "h-7 w-7" : "h-9 w-9"
                  }`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menu && (
                  <div className="absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <AssignMenu
                      label="Assign"
                      ariaLabel={`Assign ${item.issue}`}
                      align="right"
                      onSelect={(person) => {
                        onAssign(item, person)
                        setMenu(false)
                      }}
                      className="block w-full px-3 py-1.5 text-left text-[12px] text-slate-700 outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
                    />
                    {[
                      ["Snooze 1h", () => onSnooze(item)],
                      ["Dismiss", () => onDismiss(item)],
                    ].map(([label, fn]) => (
                      <button
                        key={label}
                        type="button"
                        className="block w-full px-3 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          fn()
                          setMenu(false)
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export function QueueCardSkeleton() {
  return (
    <li className="h-full rounded-xl border border-slate-200 p-3.5">
      <div className="hunt-shimmer h-4 w-3/4 rounded-full" />
      <div className="hunt-shimmer mt-3 h-3 w-full rounded-full" />
      <div className="hunt-shimmer mt-2 h-3 w-2/3 rounded-full" />
      <div className="hunt-shimmer mt-4 h-9 w-full rounded-lg" />
    </li>
  )
}
