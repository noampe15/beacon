import { useMemo, useState } from "react"
import Header from "./components/Header"
import NavFilters from "./components/NavFilters"
import CopilotBar from "./components/CopilotBar"
import OperationalImpactMatrix from "./components/OperationalImpactMatrix"
import InfrastructureDeficit from "./components/InfrastructureDeficit"
import TopRisks from "./components/TopRisks"
import InvestigationDrawer from "./components/InvestigationDrawer"
import RemediationModal from "./components/RemediationModal"
import ResourcesPage from "./components/ResourcesPage"
import SettingsPage from "./components/SettingsPage"
import { applyHunt, copilotBanner, parseCopilotQuery } from "./copilot"
import {
  applyTenant,
  businessUnits,
  deficitRows,
  environmentRiskLevel,
  expandSharedIssues,
  healthyResources,
  risks,
  tenants,
} from "./data"

const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low", "None"]

function uniqueByResourceName(rows) {
  const best = new Map()
  for (const row of rows) {
    const prev = best.get(row.name)
    if (!prev || row.score > prev.score) best.set(row.name, row)
  }
  const added = new Set()
  const out = []
  for (const row of rows) {
    if (added.has(row.name)) continue
    added.add(row.name)
    out.push(best.get(row.name))
  }
  return out
}

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
    if (filters.issue && (row.issue || "") !== filters.issue) return false
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
  const [investigating, setInvestigating] = useState(null)
  const [remediating, setRemediating] = useState(null)
  const [copilotQuery, setCopilotQuery] = useState("")
  const [hunting, setHunting] = useState(false)
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

  const { units: liveUnits, deficits: liveDeficits, risks: liveRisks, healthy: liveHealthy } = useMemo(
    () =>
      applyTenant(tenant, {
        businessUnits,
        deficitRows,
        risks,
        healthyResources,
        jitter,
        range,
      }),
    [tenant, jitter, range],
  )

  const filtered = useMemo(() => {
    const hunt = parseCopilotQuery(copilotQuery)
    return applyHunt(applyFilters(liveRisks, filters), hunt)
  }, [liveRisks, filters, copilotQuery])

  const banner = useMemo(
    () => (copilotQuery && !hunting ? copilotBanner(copilotQuery, filtered) : ""),
    [copilotQuery, hunting, filtered],
  )

  const envRisk = useMemo(() => environmentRiskLevel(liveRisks), [liveRisks])

  const envRiskByTenant = useMemo(() => {
    const map = {}
    for (const item of tenants) {
      const { risks: tenantRisks } = applyTenant(item, {
        businessUnits,
        deficitRows,
        risks,
        healthyResources,
        jitter,
        range,
      })
      map[item.id] = environmentRiskLevel(tenantRisks)
    }
    return map
  }, [jitter, range])

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

  const resourceRows = useMemo(() => {
    const hunt = parseCopilotQuery(copilotQuery)
    const findings = expandSharedIssues(filtered)
    const healthy = applyHunt(applyFilters(liveHealthy, filters), hunt)
    const combined = uniqueByResourceName([...findings, ...healthy])
    switch (filters.sort) {
      case "score-asc":
        return [...combined].sort((a, b) => a.score - b.score)
      case "rto-desc":
        return [...combined].sort((a, b) => b.rtoDelta - a.rtoDelta)
      case "name-asc":
        return [...combined].sort((a, b) => a.name.localeCompare(b.name))
      default:
        return [...combined].sort((a, b) => b.score - a.score)
    }
  }, [filtered, liveHealthy, filters, copilotQuery])

  const issuesByResource = useMemo(() => {
    const map = {}
    for (const row of liveRisks) {
      if (!row.issue) continue
      if (!map[row.name]) map[row.name] = []
      if (map[row.name].some((item) => item.issue === row.issue)) continue
      map[row.name].push({
        issue: row.issue,
        priority: row.priority,
        score: row.score,
      })
    }
    for (const name of Object.keys(map)) {
      map[name].sort((a, b) => b.score - a.score)
    }
    return map
  }, [liveRisks])

  const filterOptions = useMemo(() => {
    const catalog = [...liveRisks, ...liveHealthy]
    const priorities = uniqueInOrder(catalog.map((row) => row.priority))
    return {
      resource: uniqueInOrder([
        ...catalog.map((row) => row.name),
        ...liveRisks.flatMap((row) => row.relatedResources ?? []),
      ]),
      type: uniqueInOrder(catalog.map((row) => row.type)),
      issue: uniqueInOrder(liveRisks.map((row) => row.issue)),
      provider: uniqueInOrder(catalog.map((row) => row.provider)),
      businessUnit: uniqueInOrder(catalog.map((row) => row.businessUnit)),
      priority: PRIORITY_ORDER.filter((level) => priorities.includes(level)),
    }
  }, [liveRisks, liveHealthy])

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function onTenantChange(id) {
    setTenantId(id)
    setInvestigating(null)
    setRemediating(null)
    setFilters((prev) => ({ ...prev, resource: "" }))
  }

  function onCopilotHunt(query) {
    setHunting(true)
    if (page !== "overview") setPage("overview")
    window.setTimeout(() => {
      setCopilotQuery(query)
      setHunting(false)
    }, 900)
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
        envRisk={envRisk}
        envRiskByTenant={envRiskByTenant}
        range={range}
        setRange={setRange}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onExport={onExport}
        notifications={notifications}
        onOpenNotification={(item) => {
          if (item.risk) setInvestigating(item.risk)
        }}
      />
      <NavFilters
        page={page}
        setPage={setPage}
        filters={filters}
        options={filterOptions}
        setFilter={setFilter}
      />
      {page !== "settings" && (
        <CopilotBar
          onHunt={onCopilotHunt}
          hunting={hunting}
          banner={banner}
          lastQuery={copilotQuery}
          onClear={() => {
            setCopilotQuery("")
            setHunting(false)
          }}
        />
      )}

      <main className="px-4 pb-8 lg:px-6">
        {page === "overview" && (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <OperationalImpactMatrix units={liveUnits} range={range} />
              <InfrastructureDeficit rows={liveDeficits} />
            </div>
            <TopRisks
              rows={filtered.slice(0, 10)}
              total={liveRisks.length}
              selectedId={investigating?.id ?? remediating?.id}
              onInvestigate={setInvestigating}
              onRemediate={setRemediating}
            />
          </div>
        )}
        {page === "resources" && (
          <ResourcesPage
            rows={resourceRows}
            selectedId={investigating?.id ?? remediating?.id}
            issuesByResource={issuesByResource}
            onInvestigate={setInvestigating}
            onRemediate={setRemediating}
          />
        )}
        {page === "settings" && <SettingsPage />}
      </main>

      <InvestigationDrawer risk={investigating} onClose={() => setInvestigating(null)} />
      <RemediationModal risk={remediating} onClose={() => setRemediating(null)} />
    </div>
  )
}
