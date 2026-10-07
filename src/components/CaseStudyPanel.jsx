import { ChevronDown, ChevronUp } from "lucide-react"
import { mspCaseStudy } from "../mspDashboard"

export default function CaseStudyPanel({ open, onToggle }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
      >
        <span>
          <span className="block text-[16px] font-semibold text-slate-900">Case Study</span>
          <span className="block text-[12px] text-slate-500">Why this HITL design exists</span>
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-slate-100 px-5 py-4 text-[13px] leading-relaxed text-slate-700">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Persona</p>
            <p className="mt-1">{mspCaseStudy.persona}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Problem</p>
            <p className="mt-1">{mspCaseStudy.problem}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Success metrics</p>
            <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
              {mspCaseStudy.metrics.map((m) => (
                <li key={m.label} className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="block text-[11px] text-slate-500">{m.label}</span>
                  <span className="font-medium text-slate-800">{m.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">What I cut or deferred, and why</p>
            <ol className="mt-1.5 list-decimal space-y-1.5 pl-4">
              {mspCaseStudy.deferred.map((d) => (
                <li key={d.cut}>
                  <span className="font-medium text-slate-800">{d.cut}.</span> {d.why}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  )
}
