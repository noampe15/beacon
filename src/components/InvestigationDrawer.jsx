import { useEffect, useState } from "react"
import { Sparkles, X, Zap } from "lucide-react"
import { getInvestigation } from "../data"
import { SeverityBadge } from "./Badges"
import RemediationPlanBody from "./RemediationPlanBody"
import TypewriterText from "./TypewriterText"

export default function InvestigationDrawer({ risk, onClose }) {
  const [queued, setQueued] = useState(false)

  useEffect(() => {
    setQueued(false)
  }, [risk?.id])

  if (!risk) return null
  const brief = getInvestigation(risk)
  const extraCount = brief.peers.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="ai-investigation-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#6d5cff]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f1ff]">
                <Sparkles className="h-4 w-4" />
              </span>
              AI Risk Investigation
            </div>
            <h2 id="ai-investigation-title" className="mt-2 text-[18px] font-semibold tracking-tight text-slate-900">
              {risk.issue}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-slate-400">
              <span className="font-medium text-slate-600">{risk.name}</span>
              <span>·</span>
              <span>
                {risk.provider} {risk.type}
              </span>
              <span>·</span>
              <span>
                {risk.tier} {risk.businessUnit}
              </span>
              <SeverityBadge severity={risk.priority} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
            aria-label="Close investigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {extraCount > 0 && (
            <p className="text-[12.5px] text-slate-500">
              {`Also affects ${extraCount} more ${extraCount === 1 ? "resource" : "resources"}`}
            </p>
          )}

          <p className={`${extraCount > 0 ? "mt-5" : ""} text-[11px] font-semibold tracking-wide text-slate-400`}>BRIEFING</p>
          <div className="mt-2 rounded-xl border border-[#ece8ff] bg-[#faf9ff] px-3.5 py-3">
            <TypewriterText
              key={risk.id}
              text={brief.narrative}
              className="text-[13.5px] leading-relaxed text-slate-700"
            />
          </div>

          <RemediationPlanBody risk={risk} hideIssueWhy />
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          {queued ? (
            <p className="rounded-xl bg-emerald-50 py-2.5 text-center text-[13px] font-semibold text-emerald-700">
              Remediation queued for {risk.name}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setQueued(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-[13.5px] font-semibold text-white hover:bg-slate-800"
            >
              <Zap className="h-4 w-4 fill-current" />
              Remediate Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
