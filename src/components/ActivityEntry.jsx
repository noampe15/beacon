import { Check, RotateCcw, ArrowUpRight, CheckCheck, X, Wrench, UserRound } from "lucide-react"

const OUTCOMES = {
  Fixed: { label: "Fixed", Icon: Check, className: "bg-emerald-50 text-emerald-800" },
  "Rolled back": { label: "Rolled back", Icon: RotateCcw, className: "bg-slate-100 text-slate-700" },
  Escalated: { label: "Escalated", Icon: ArrowUpRight, className: "bg-amber-50 text-amber-900" },
  "Approved unchanged": { label: "Approved unchanged", Icon: CheckCheck, className: "bg-emerald-50 text-emerald-800" },
  Rejected: { label: "Rejected", Icon: X, className: "bg-rose-50 text-rose-800" },
  "Manually applied": { label: "Manually applied", Icon: Wrench, className: "bg-slate-100 text-slate-800" },
}

function ConfidenceRing({ value }) {
  const r = 16
  const c = 2 * Math.PI * r
  const offset = c * (1 - value / 100)
  return (
    <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center" role="img" aria-label={`Confidence ${value}%`}>
      <svg viewBox="0 0 40 40" className="h-12 w-12 -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#ece8ff" strokeWidth="3.5" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="#6d5cff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-semibold text-slate-800">{value}</span>
    </span>
  )
}

function ActorAvatar({ name, shortName }) {
  const initials = (shortName ?? name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <span
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff] text-[12px] font-semibold text-[#5b4cf0]"
      role="img"
      aria-label={name}
    >
      {initials || <UserRound className="h-5 w-5" aria-hidden="true" />}
    </span>
  )
}

export default function ActivityEntry({ entry, onAction }) {
  const human = entry.actorKind === "human"
  const outcome = OUTCOMES[entry.outcome] ?? OUTCOMES.Fixed
  return (
    <article className="flex flex-1 items-start gap-3 border-t border-slate-100 py-3 first:border-t-0 first:pt-0 last:pb-0">
      {human ? <ActorAvatar name={entry.actorName ?? entry.actor} shortName={entry.actor} /> : <ConfidenceRing value={entry.confidence} />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[13.5px] font-semibold text-slate-900">{entry.title}</h3>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${outcome.className}`}>
            <outcome.Icon className="h-3 w-3" aria-hidden="true" />
            {outcome.label}
          </span>
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{entry.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.chips.map((chip) => (
            <span key={chip} className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              {chip}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAction?.(entry)}
        className="shrink-0 pt-0.5 text-[12px] font-semibold text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
      >
        {entry.actionLabel}
      </button>
    </article>
  )
}
