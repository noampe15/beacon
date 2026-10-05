export const severityStyles = {
  Critical: {
    text: "text-[#e11d48]",
    bg: "bg-[#fff1f2]",
    dot: "bg-[#e11d48]",
    bar: "bg-[#e11d48]",
    ring: "#e11d48",
  },
  High: {
    text: "text-[#ea580c]",
    bg: "bg-[#fff7ed]",
    dot: "bg-[#ea580c]",
    bar: "bg-[#f97316]",
    ring: "#ea580c",
  },
  Medium: {
    text: "text-[#ca8a04]",
    bg: "bg-[#fefce8]",
    dot: "bg-[#ca8a04]",
    bar: "bg-[#eab308]",
    ring: "#ca8a04",
  },
  Low: {
    text: "text-[#a3a31c]",
    bg: "bg-[#f7f8e8]",
    dot: "bg-[#c4c43a]",
    bar: "bg-[#d4d45c]",
    ring: "#b8b82e",
  },
}

export const providerStyles = {
  AWS: "bg-[#fff4ed] text-[#c2410c]",
  Azure: "bg-[#eff6ff] text-[#2563eb]",
  GCP: "bg-[#ecfdf3] text-[#16a34a]",
}

export function SeverityBadge({ severity }) {
  const style = severityStyles[severity] ?? severityStyles.Medium
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {severity}
    </span>
  )
}

export function ProviderBadge({ provider }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${providerStyles[provider] ?? "bg-slate-100 text-slate-600"}`}
    >
      {provider}
    </span>
  )
}

export function ScoreRing({ score, size = 40, stroke = 3 }) {
  const r = (size - stroke * 2) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color =
    score >= 80 ? "#e11d48" : score >= 60 ? "#ea580c" : score >= 40 ? "#ca8a04" : "#b8b82e"

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f2f4"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-semibold text-slate-800">{score}</span>
    </div>
  )
}
