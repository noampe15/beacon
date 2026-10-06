import { useEffect, useState } from "react"
import { Check, GitPullRequest, Sparkles, Wrench, X, Zap } from "lucide-react"
import { getAiRemediation } from "../data"
import SharedIssueScope from "./SharedIssueScope"

export default function RemediationModal({ risk, onClose }) {
  const [queued, setQueued] = useState(false)
  const [prOpened, setPrOpened] = useState(false)
  const pack = risk ? getAiRemediation(risk) : null

  useEffect(() => {
    setQueued(false)
    setPrOpened(false)
  }, [risk?.id])

  if (!risk || !pack) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/35 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="ai-remediation-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#6d5cff]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f1ff]">
                <Wrench className="h-4 w-4" />
              </span>
              AI Remediation Engine
            </div>
            <h2 id="ai-remediation-title" className="mt-2 text-[18px] font-semibold tracking-tight text-slate-900">
              {risk.name}
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">{risk.issue}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
            aria-label="Close remediation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          <SharedIssueScope risk={risk} />

          <p className="mt-5 text-[11px] font-semibold tracking-wide text-slate-400">AI SUMMARY OF CHANGES</p>
          <p className="mt-2 rounded-xl border border-[#ece8ff] bg-[#faf9ff] px-3.5 py-3 text-[13.5px] leading-relaxed text-slate-700">
            <Sparkles className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px text-[#6d5cff]" />
            {pack.summary}
          </p>

          <p className="mt-5 text-[11px] font-semibold tracking-wide text-slate-400">SUGGESTED TERRAFORM / IAC DIFF</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-[#0f172a] px-4 py-3 font-mono text-[12px] leading-relaxed text-slate-200">
            {pack.diff.map((line, i) => {
              const tone =
                line.startsWith("+") && !line.startsWith("+++")
                  ? "text-emerald-300"
                  : line.startsWith("-") && !line.startsWith("---")
                    ? "text-rose-300"
                    : "text-slate-300"
              return (
                <span key={`${i}-${line}`} className={`block ${tone}`}>
                  {line || " "}
                </span>
              )
            })}
          </pre>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setPrOpened(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-[13.5px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            {prOpened ? <Check className="h-4 w-4 text-emerald-600" /> : <GitPullRequest className="h-4 w-4" />}
            {prOpened ? "PR preview staged" : "Preview PR in GitHub"}
          </button>
          <button
            type="button"
            onClick={() => setQueued(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-[13.5px] font-semibold text-white hover:bg-slate-800"
          >
            <Zap className="h-4 w-4 fill-current" />
            {queued ? "Auto-remediate queued" : "1-Click Auto-Remediate"}
          </button>
        </div>
      </div>
    </div>
  )
}
