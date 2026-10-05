import { useMemo, useState } from "react"
import Header from "./components/Header"
import NavFilters from "./components/NavFilters"
import OperationalImpactMatrix from "./components/OperationalImpactMatrix"
import InfrastructureDeficit from "./components/InfrastructureDeficit"
import TopRisks from "./components/TopRisks"
import RemediationDrawer from "./components/RemediationDrawer"
import ResourcesPage from "./components/ResourcesPage"
import SettingsPage from "./components/SettingsPage"
import { applyTenant, businessUnits, deficitRows, expandSharedIssues, risks, tenants } from "./data"

const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"]

function uniqueInOrder(values) {
  const seen = new Set()
  const out = []
  for (const value of values) {
    if (!value || seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function applyFilters(list, filters) {
  let next = list.filter((row) => {
    if (
      filters.resource &&
      row.name !== filters.resource &&
      !(row.relatedResources ?? []).includes(filters.resource)
    ) {
      return false
    }
    if (filters.type && row.type !== filters.type) return false
    if (filters.issue && row.issue !== filters.issue) return false
    if (filters.provider && row.provider !== filters.provider) return false
    if (filters.businessUnit && row.businessUnit !== filters.businessUnit) return false
    if (filters.priority && row.priority !== filters.priority) return false
    return true
  })

  switch (filters.sort) {
    case "score-asc":
      next = [...next].sort((a, b) => a.score - b.score)
      break
    case "rto-desc":
      next = [...next].sort((a, b) => b.rtoDelta - a.rtoDelta)
      break
    case "name-asc":
      next = [...next].sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      next = [...next].sort((a, b) => b.score - a.score)
  }
  return next
}

export default function App() {
  const [page, setPage] = useState("overview")
  const [tenantId, setTenantId] = useState(tenants[0].id)
  const [range, setRange] = useState("Last 7 Days")
  const [refreshing, setRefreshing] = useState(false)
  const [jitter, setJitter] = useState(0)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({
    resource: "",
    type: "",
    issue: "",
    provider: "",
    businessUnit: "",
    priority: "",
    sort: "score-desc",
  })

  const tenant = tenants.find((t) => t.id === tenantId) ?? tenants[0]

  const { units: liveUnits, deficits: liveDeficits, risks: liveRisks } = useMemo(
    () =>
      applyTenant(tenant, {
        businessUnits,
        deficitRows,
        risks,
        jitter,
        range,
      }),
    [tenant, jitter, range],
  )

  const filtered = useMemo(() => applyFilters(liveRisks, filters), [liveRisks, filters])

  const notifications = useMemo(() => {
    const items = []
    if (tenant.status !== "live") {
      items.push({
        id: `tenant-${tenant.id}`,
        title: tenant.statusLabel,
        body: `${tenant.name} environment needs attention`,
        time: "just now",
        priority: tenant.status === "incident" ? "Critical" : "High",
      })
    }
    for (const row of liveRisks) {
      if (row.priority !== "Critical" && row.priority !== "High") continue
      items.push({
        id: row.id,
        title: row.issue,
        body: row.name,
        time: (row.checkedAgo ?? "").replace(/^checked\s+/i, ""),
        priority: row.priority,
        risk: row,
      })
    }
    return items.slice(0, 8)
  }, [liveRisks, tenant])

  const resourceRows = useMemo(() => expandSharedIssues(filtered), [filtered])

  const filterOptions = useMemo(() => {
    const priorities = uniqueInOrder(liveRisks.map((row) => row.priority))
    return {
      resource: uniqueInOrder([
        ...liveRisks.map((row) => row.name),
        ...liveRisks.flatMap((row) => row.relatedResources ?? []),
      ]),
      type: uniqueInOrder(liveRisks.map((row) => row.type)),
      issue: uniqueInOrder(liveRisks.map((row) => row.issue)),
      provider: uniqueInOrder(liveRisks.map((row) => row.provider)),
      businessUnit: uniqueInOrder(liveRisks.map((row) => row.businessUnit)),
      priority: PRIORITY_ORDER.filter((level) => priorities.includes(level)),
    }
  }, [liveRisks])

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function onTenantChange(id) {
    setTenantId(id)
    setSelected(null)
    setFilters((prev) => ({ ...prev, resource: "" }))
  }

  function onRefresh() {
    setRefreshing(true)
    setJitter((n) => (n === 0 ? 1 : 0))
    window.setTimeout(() => setRefreshing(false), 700)
  }

  function onExport() {
    const header = [
      "Resource",
      "Type",
      "Business Unit",
      "Issue",
      "Provider",
      "RTO Delta",
      "TBR",
      "Priority",
      "Score",
    ]
    const lines = filtered.map((row) =>
      [
        row.name,
        row.type,
        row.businessUnit,
        row.issue,
        row.provider,
        `+${row.rtoDelta}h`,
        row.tbr,
        row.priority,
        row.score,
      ]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    const csv = [header.join(","), ...lines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "beacon-top-risks.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-svh bg-[#f4f5f8]">
      <Header
        tenants={tenants}
        tenantId={tenantId}
        onTenantChange={onTenantChange}
        tenant={tenant}
        range={range}
        setRange={setRange}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onExport={onExport}
        notifications={notifications}
        onOpenNotification={(item) => {
          if (item.risk) setSelected(item.risk)
        }}
      />
      <NavFilters
        page={page}
        setPage={setPage}
        filters={filters}
        options={filterOptions}
        setFilter={setFilter}
      />

      <main className="px-4 pb-8 lg:px-6">
        {page === "overview" && (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <OperationalImpactMatrix units={liveUnits} range={range} />
              <InfrastructureDeficit rows={liveDeficits} />
            </div>
            <TopRisks rows={filtered} selectedId={selected?.id} onRemediate={setSelected} />
          </div>
        )}
        {page === "resources" && <ResourcesPage rows={resourceRows} onRemediate={setSelected} />}
        {page === "settings" && <SettingsPage />}
      </main>

      <RemediationDrawer risk={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
