import { useEffect, useMemo, useState } from "react"
import QueueCard, { QueueCardSkeleton } from "./QueueCard"
import InfoTooltip from "./InfoTooltip"
import AnnotationPin from "./AnnotationPin"
import { rankMspQueue, slaRiskScore, QUEUE_AI_STATUSES, QUEUE_AGE_BUCKETS } from "../mspDashboard"
import AssignMenu from "./AssignMenu"
import FilterMenu from "./FilterMenu"

export default function ActionQueueRail({
  items,
  filterChips,
  onClearFilters,
  selectedId,
  onReview,
  pmNotes,
  onOpenNote,
  onAssign,
  onSnooze,
  onDismiss,
  onBulkApprove,
  onBulkAssign,
  compact = false,
  onViewAll,
  search = "",
  onSearch,
  allFilters = null,
  scope = "global",
  totalCount,
  onRequestAccess,
  queueAiStatus,
  queueAge,
  onQueueAiStatus,
  onQueueAge,
  headerAction = null,
}) {
  const [now, setNow] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [bulkMode, setBulkMode] = useState(false)
  const [checked, setChecked] = useState(() => new Set())
  const ranked = useMemo(() => rankMspQueue(items, now), [items, now])
  const visible = useMemo(() => {
    if (!compact) return ranked
    if (scope === "tenant") return ranked.slice(0, 3)
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 }
    return [...ranked]
      .sort((a, b) => {
        const pd = (order[a.priority] ?? 9) - (order[b.priority] ?? 9)
        return pd !== 0 ? pd : slaRiskScore(b, now) - slaRiskScore(a, now)
      })
      .slice(0, 3)
  }, [compact, ranked, now, scope])

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 420)
    const tick = window.setInterval(() => setNow(Date.now()), 30000)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(tick)
    }
  }, [])

  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedItems = ranked.filter((row) => checked.has(row.id))
  const tenant = scope === "tenant"
  const shownOf = totalCount ?? ranked.length
  const showing = compact ? Math.min(3, ranked.length) : ranked.length
  const title = "Action queue"
  const subtitle = tenant
    ? `Ranked by SLA risk × blast radius · showing ${showing} of ${shownOf}`
    : "Requires human-in-the-loop approval"

  return (
    <section
      className={`relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
        compact && !tenant ? "min-h-0" : compact ? "min-h-[28rem]" : "min-h-[28rem] lg:min-h-[36rem]"
      }`}
    >
      <div className={`shrink-0 border-b border-slate-100 ${compact && !tenant ? "px-3 py-2.5" : "px-4 py-3"}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-[12px] text-slate-600">{subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            {headerAction}
            {compact && (
              <button
                type="button"
                onClick={onViewAll}
                aria-label="View all in Remediation"
                className="text-[13px] font-semibold text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
              >
                {tenant ? "View all in Remediation →" : "View all"}
              </button>
            )}
          </div>
        </div>
        {!tenant && (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-600" data-pin="queue-rank">
          Ranked by SLA risk × tenants affected
          <InfoTooltip label="How the queue is ranked">
            Score = (1 / hours to RTO breach) × tenants affected. A High item hitting 14 tenants can outrank a Critical hitting one.
          </InfoTooltip>
          {!compact && pmNotes && <AnnotationPin n={3} noteId={3} onOpen={onOpenNote} className="ml-1" />}
        </p>
        )}
        {!compact && (
          <>
            {typeof onSearch === "function" && (
              <div className="relative mt-3">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  aria-label="Search the action queue"
                  placeholder="Search issues or tenants"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                />
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
              <span>{tenant ? `${ranked.length} in scope` : `${ranked.length} of 78 in scope`}</span>
              {!tenant && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">Needs human approval</span>
              )}
              {filterChips.map((chip) => (
                <span key={chip} className="rounded-full bg-[#f3f1ff] px-2 py-0.5 font-medium text-[#5b4cf0]">
                  {chip}
                </span>
              ))}
              {filterChips.length > 0 && (
                <button type="button" className="font-medium text-[#6d5cff] underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]" onClick={onClearFilters}>
                  Clear filters
                </button>
              )}
              {allFilters}
            </div>
            {typeof onQueueAiStatus === "function" && (
              <div className="mt-2 flex flex-wrap gap-2">
                <FilterMenu label="AI status" options={QUEUE_AI_STATUSES} value={queueAiStatus} onChange={onQueueAiStatus} />
                <FilterMenu label="Age" options={QUEUE_AGE_BUCKETS} value={queueAge} onChange={onQueueAge} />
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2" data-pin="queue-bulk">
              <button
                type="button"
                onClick={() => {
                  setBulkMode((v) => !v)
                  setChecked(new Set())
                }}
                className={`inline-flex h-8 items-center rounded-full border px-3 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                  bulkMode ? "border-[#6d5cff] bg-[#f3f1ff] text-[#6d5cff]" : "border-slate-200 text-slate-600"
                }`}
              >
                Select multiple
              </button>
              {bulkMode && (
                <>
                  <button
                    type="button"
                    disabled={selectedItems.length === 0}
                    onClick={() => onBulkApprove(selectedItems)}
                    className="inline-flex h-8 items-center rounded-full bg-[#6d5cff] px-3 text-[12px] font-semibold text-white disabled:opacity-40"
                  >
                    Approve all similar ({selectedItems.length})
                  </button>
                  <AssignMenu
                    label={`Assign${selectedItems.length ? ` (${selectedItems.length})` : ""}`}
                    ariaLabel="Assign selected items"
                    disabled={selectedItems.length === 0}
                    onSelect={(person) => onBulkAssign(selectedItems, person)}
                    className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3 text-[12px] font-medium text-slate-700 outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                  />
                </>
              )}
              {pmNotes && <AnnotationPin n={4} noteId={4} onOpen={onOpenNote} />}
            </div>
          </>
        )}
      </div>
      <ul
        className={`min-h-0 flex-1 ${
          compact && !tenant
            ? "flex flex-col gap-2 overflow-hidden p-2"
            : "space-y-2.5 overflow-y-auto scroll-smooth overscroll-contain p-3"
        }`}
      >
        {loading
          ? (compact ? [1, 2, 3] : [1, 2, 3]).map((k) => (
              <div key={k} className={compact && !tenant ? "min-h-0 flex-1" : undefined}>
                <QueueCardSkeleton />
              </div>
            ))
          : visible.map((item, idx) => (
              <div
                key={item.id}
                className={compact && !tenant ? "relative flex min-h-0 w-full flex-1" : "relative"}
                data-pin={!compact && idx === 0 ? "queue-card" : undefined}
              >
                {!compact && pmNotes && idx === 0 && (
                  <AnnotationPin n={2} noteId={2} onOpen={onOpenNote} className="absolute -right-1 -top-1" />
                )}
                <QueueCard
                  item={item}
                  selected={selectedId === item.id}
                  bulkMode={!compact && bulkMode}
                  checked={checked.has(item.id)}
                  onCheck={toggle}
                  onReview={onReview}
                  onAssign={onAssign}
                  onSnooze={onSnooze}
                  onDismiss={onDismiss}
                  onRequestAccess={onRequestAccess}
                  now={now}
                  scope={scope}
                  compact={compact}
                />
              </div>
            ))}
        {!loading && visible.length === 0 && (
          <li className="py-10 text-center text-sm text-slate-600">
            {tenant && ranked.length === 0 ? "All clear" : "No escalations match the current filters."}
          </li>
        )}
      </ul>
    </section>
  )
}
