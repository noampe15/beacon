import { Building2, Check, ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { severityStyles } from "./Badges"
import { envRiskSeverity } from "../data"

export default function TenantSelector({ tenants, value, onChange, envRiskByTenant }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = tenants.find((t) => t.id === value) ?? tenants[0]

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 max-w-[220px] items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-[13px] font-medium text-slate-700 hover:border-slate-300"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select customer environment"
      >
        <Building2 className="h-3.5 w-3.5 shrink-0 text-[#6d5cff]" />
        <span className="truncate">{current.name}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {tenants.map((tenant) => {
            const selected = tenant.id === current.id
            return (
              <button
                key={tenant.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(tenant.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 ${
                  selected ? "bg-[#f7f6ff]" : ""
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600">
                  {tenant.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-slate-800">{tenant.name}</span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        (severityStyles[envRiskSeverity[envRiskByTenant?.[tenant.id]]] ?? severityStyles.None).dot
                      }`}
                    />
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">{tenant.env}</span>
                </span>
                {selected && <Check className="h-4 w-4 text-[#6d5cff]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
