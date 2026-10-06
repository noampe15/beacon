import { useState } from "react"
import { Sparkles, X } from "lucide-react"
import { COPILOT_PILLS } from "../copilot"

export default function CopilotBar({ onHunt, hunting, banner, onClear, lastQuery }) {
  const [value, setValue] = useState("")

  function submit(query) {
    const q = (query ?? value).trim()
    if (!q) return
    setValue(q)
    onHunt(q)
  }

  return (
    <div className="px-4 pb-3 lg:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3f1ff] text-[#6d5cff]">
            <Sparkles className="h-4 w-4" />
          </span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="AI Assistant — ask in plain English, e.g. Filter Tier-1 Critical Risks"
            className="h-9 min-w-0 flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
            aria-label="AI Assistant search"
          />
          {lastQuery ? (
            <button
              type="button"
              onClick={() => {
                setValue("")
                onClear()
              }}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              aria-label="Clear AI Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="submit"
            className="h-9 shrink-0 rounded-full bg-[#6d5cff] px-4 text-[13px] font-semibold text-white hover:bg-[#5b4cf0]"
          >
            Hunt
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
          {COPILOT_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => submit(pill.label)}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-medium text-slate-600 hover:border-[#6d5cff]/40 hover:bg-[#f3f1ff] hover:text-[#6d5cff]"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </form>

      {hunting && (
        <div className="mt-2 overflow-hidden rounded-xl border border-[#ece8ff]">
          <div className="hunt-shimmer h-10" />
        </div>
      )}

      {!hunting && banner ? (
        <div className="mt-2 rounded-xl border border-[#ece8ff] bg-[#faf9ff] px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700">
          <span className="mr-1.5 font-semibold text-[#6d5cff]">AI Assistant</span>
          {banner}
        </div>
      ) : null}
    </div>
  )
}
