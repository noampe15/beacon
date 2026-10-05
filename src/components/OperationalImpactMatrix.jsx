import { Headphones, ShoppingCart, Truck, Users } from "lucide-react"
import { SeverityBadge, severityStyles } from "./Badges"

const icons = {
  cart: ShoppingCart,
  truck: Truck,
  headset: Headphones,
  users: Users,
}

export default function OperationalImpactMatrix({ units, range }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-5 flex items-start justify-between">
        <h2 className="text-[16px] font-semibold text-slate-900">Operational Impact Matrix</h2>
        <span className="text-[12px] text-slate-400">{range.replace("Last ", "")}</span>
      </div>
      <ul className="space-y-5">
        {units.map((unit) => {
          const Icon = icons[unit.icon]
          const style = severityStyles[unit.severity]
          const up = unit.delta >= 0
          return (
            <li key={unit.id} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[13.5px] font-semibold text-slate-800">{unit.name}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-[22px] font-semibold leading-none text-slate-800">
                      {unit.score}
                      <span className="ml-0.5 text-[11px] font-medium text-slate-400">/100</span>
                    </p>
                    <SeverityBadge severity={unit.severity} />
                  </div>
                </div>
                <p className="mt-0.5 text-[12px] text-slate-400">
                  RTO {unit.rto} · {unit.resources} resources{" "}
                  <span className={up ? "text-[#e11d48]" : "text-[#16a34a]"}>
                    {up ? "↗" : "↘"} {up ? "+" : ""}
                    {unit.delta.toFixed(1)} pts (7d)
                  </span>
                </p>
                <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${style.bar}`}
                    style={{ width: `${unit.score}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
