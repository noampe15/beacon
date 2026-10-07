import { useState } from "react"
import { Sparkles, X } from "lucide-react"
import TypewriterText from "./TypewriterText"

export default function CopilotBar({
  onHunt,
  hunting,
  banner,
  onClear,
  lastQuery,
  global = false,
  placeholder,
  suggestions = [],
}) {
  const [value, setValue] = useState("")
  const name = "AI Assistant"

  function submit(query) {
    const q = (query ?? value).trim()
    if (!q) return
    setValue(q)
    onHunt(q)
  }

  return (
    <div className="px-3 pb-3 lg:px-4">
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
            placeholder={
              placeholder ??
              "AI Assistant — ask in plain English, e.g. produce posture report"
            }
            className="h-9 min-w-0 flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
            aria-label={`${name} search`}
          />
          {lastQuery ? (
            <button
              type="button"
              onClick={() => {
                setValue("")
                onClear()
              }}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              aria-label={`Clear ${name}`}
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
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
            {suggestions.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => submit(chip)}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-700 outline-none hover:border-[#6d5cff]/40 hover:bg-[#f3f1ff] focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </form>

      {hunting && (
        <div className="mt-2 overflow-hidden rounded-xl border border-[#ece8ff] bg-[#faf9ff] px-3.5 py-3">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#6d5cff]">
            <Sparkles className="h-3.5 w-3.5" />
            {global ? "AI Assistant is clustering portfolio signals…" : "AI Assistant is scanning this environment…"}
          </div>
          <div className="space-y-2">
            <div className="hunt-shimmer h-3 w-[92%] rounded-full" />
            <div className="hunt-shimmer h-3 w-[74%] rounded-full" />
            <div className="hunt-shimmer h-3 w-[58%] rounded-full" />
          </div>
        </div>
      )}

      {!hunting && banner ? (
        <div className="mt-2 rounded-xl border border-[#ece8ff] bg-[#faf9ff] px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700">
          <span className="mr-1.5 font-semibold text-[#6d5cff]">{name}</span>
          <TypewriterText key={banner} text={banner} as="span" className="text-[13px] leading-relaxed text-slate-700" />
        </div>
      ) : null}
    </div>
  )
}
