export default function OutcomeBar({ succeeded = 0, rolledBack = 0, escalated = 0 }) {
  const total = succeeded + rolledBack + escalated
  const parts = [
    { key: "Succeeded", n: succeeded, className: "bg-[#6d5cff]" },
    { key: "Rolled back", n: rolledBack, className: "bg-[#c4b8ff]" },
    { key: "Escalated", n: escalated, className: "bg-slate-400" },
  ]
  return (
    <div
      className="flex h-3 overflow-hidden rounded-full bg-slate-100"
      role="img"
      aria-label={`${succeeded} succeeded, ${rolledBack} rolled back, ${escalated} escalated`}
    >
      {total === 0 ? (
        <span className="w-full bg-slate-200" />
      ) : (
        parts.map((part) =>
          part.n ? (
            <span
              key={part.key}
              className={part.className}
              style={{ width: `${(part.n / total) * 100}%` }}
              title={`${part.key}: ${part.n}`}
            />
          ) : null,
        )
      )}
    </div>
  )
}
