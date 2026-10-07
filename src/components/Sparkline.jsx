import { useState } from "react"

export default function Sparkline({ series, valueKey, ariaLabel, formatHover, compact = false, unitLabel = "" }) {
  const [hover, setHover] = useState(null)
  const w = 240
  const h = compact ? 28 : 64
  const pad = compact ? { l: 4, r: 8, t: 6, b: 4 } : { l: 22, r: 22, t: 8, b: 20 }
  if (!series?.length) {
    return <div className={compact ? "h-7" : "h-16"} aria-hidden="true" />
  }
  const values = series.map((p) => p[valueKey])
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = Math.max(1, max - min)
  const denom = Math.max(1, series.length - 1)
  const coords = series.map((p, i) => {
    const x = pad.l + (i / denom) * (w - pad.l - pad.r)
    const y = pad.t + (1 - (p[valueKey] - min) / span) * (h - pad.t - pad.b)
    return { ...p, x, y, i }
  })
  const pts = coords.map((p) => `${p.x},${p.y}`).join(" ")
  const mid = Math.floor((series.length - 1) / 2)
  const labeled = new Set([0, mid, series.length - 1])

  function anchorFor(i) {
    if (i === 0) return "start"
    if (i === series.length - 1) return "end"
    return "middle"
  }

  return (
    <div className="relative">
      {unitLabel && !compact && <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">{unitLabel}</p>}
      <svg viewBox={`0 0 ${w} ${h}`} className={compact ? "h-7 w-full" : "h-16 w-full"} role="img" aria-label={ariaLabel}>
        <polyline fill="none" stroke="#b8aeff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts} />
        {coords.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r={hover?.date === p.date ? 3.5 : 2}
            fill="#8b7dff"
            tabIndex={0}
            role="img"
            aria-label={`${p.date}: ${formatHover(p)}`}
            className="cursor-pointer outline-none focus-visible:stroke-[#5b4cf0] focus-visible:stroke-2"
            onMouseEnter={() => setHover(p)}
            onMouseLeave={() => setHover((cur) => (cur?.date === p.date ? null : cur))}
            onFocus={() => setHover(p)}
            onBlur={() => setHover((cur) => (cur?.date === p.date ? null : cur))}
          />
        ))}
        {!compact &&
          coords
            .filter((p) => labeled.has(p.i))
            .map((p) => (
              <text key={`t-${p.date}`} x={p.x} y={h - 2} textAnchor={anchorFor(p.i)} fill="#64748b" fontSize="8">
                {p.date}
              </text>
            ))}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute -top-1 left-1/2 z-10 w-40 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-[11px] text-slate-600 shadow">
          <span className="font-semibold text-slate-800">{hover.date}</span>
          <span className="mt-0.5 block">{formatHover(hover)}</span>
        </div>
      )}
    </div>
  )
}
