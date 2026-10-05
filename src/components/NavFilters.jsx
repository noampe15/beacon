import { LayoutGrid, Search, Settings2, SlidersHorizontal } from "lucide-react"
import FilterMenu from "./FilterMenu"
import { sortOptions } from "../data"

export default function NavFilters({ page, setPage, filters, options, setFilter }) {
  return (
    <div className="flex flex-col gap-2 px-4 pb-3 lg:flex-row lg:flex-wrap lg:items-center lg:px-6">
      <nav className="flex items-center gap-1">
        {[
          { id: "overview", label: "Overview", icon: LayoutGrid },
          { id: "resources", label: "Resources", icon: null },
          { id: "settings", label: "Settings", icon: SlidersHorizontal },
        ].map((item) => {
          const Icon = item.icon
          const active = page === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(item.id)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-[13.5px] font-medium ${
                active ? "text-[#6d5cff]" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-[#6d5cff]" />
              )}
            </button>
          )
        })}
      </nav>

      {page !== "settings" && (
        <div className="relative z-30 flex flex-wrap gap-2 pb-1 lg:flex-1">
          <FilterMenu
            label="Resource"
            searchable
            icon={<Search className="h-3.5 w-3.5" />}
            options={options.resource}
            value={filters.resource}
            onChange={(v) => setFilter("resource", v)}
          />
          <FilterMenu
            label="Type"
            icon={<Settings2 className="h-3.5 w-3.5" />}
            options={options.type}
            value={filters.type}
            onChange={(v) => setFilter("type", v)}
          />
          <FilterMenu
            label="Issue"
            searchable
            options={options.issue}
            value={filters.issue}
            onChange={(v) => setFilter("issue", v)}
          />
          <FilterMenu
            label="Provider"
            options={options.provider}
            value={filters.provider}
            onChange={(v) => setFilter("provider", v)}
          />
          <FilterMenu
            label="Business Unit"
            options={options.businessUnit}
            value={filters.businessUnit}
            onChange={(v) => setFilter("businessUnit", v)}
          />
          <FilterMenu
            label="Priority"
            options={options.priority}
            value={filters.priority}
            onChange={(v) => setFilter("priority", v)}
          />
          <FilterMenu
            label="Sort"
            options={sortOptions.map((s) => s.label)}
            value={
              filters.sort === "score-desc"
                ? ""
                : (sortOptions.find((s) => s.id === filters.sort)?.label ?? "")
            }
            onChange={(label) => {
              const found = sortOptions.find((s) => s.label === label)
              setFilter("sort", found ? found.id : "score-desc")
            }}
          />
        </div>
      )}
    </div>
  )
}
