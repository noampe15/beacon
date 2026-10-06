export const COPILOT_PILLS = [
  { id: "tier1-crit", label: "Filter Tier-1 Critical Risks" },
  { id: "aws-drift", label: "Show AWS drift issues" },
]

export function parseCopilotQuery(raw) {
  const q = String(raw ?? "").trim()
  const t = q.toLowerCase()
  const hunt = {
    tier: "",
    provider: "",
    priority: "",
    issueContains: "",
  }

  if (/tier[-\s]?1/.test(t)) hunt.tier = "Tier-1"
  else if (/tier[-\s]?2/.test(t)) hunt.tier = "Tier-2"
  else if (/tier[-\s]?3/.test(t)) hunt.tier = "Tier-3"

  if (/\bcritical\b/.test(t)) hunt.priority = "Critical"
  else if (/\bhigh\b/.test(t)) hunt.priority = "High"
  else if (/\bmedium\b/.test(t)) hunt.priority = "Medium"
  else if (/\blow\b/.test(t)) hunt.priority = "Low"

  if (/\baws\b/.test(t)) hunt.provider = "AWS"
  else if (/\bazure\b/.test(t)) hunt.provider = "Azure"
  else if (/\bgcp\b/.test(t)) hunt.provider = "GCP"

  if (/\bdrift\b/.test(t)) hunt.issueContains = "drift"
  else if (/\bcve|unpatched|kernel\b/.test(t)) hunt.issueContains = "cve"
  else if (/\btls|certificate|cert\b/.test(t)) hunt.issueContains = "tls"

  return hunt
}

export function huntIsActive(hunt) {
  return Boolean(hunt?.tier || hunt?.provider || hunt?.priority || hunt?.issueContains)
}

export function applyHunt(list, hunt) {
  if (!huntIsActive(hunt)) return list
  const needle = (hunt.issueContains ?? "").toLowerCase()
  return list.filter((row) => {
    if (hunt.tier && row.tier !== hunt.tier) return false
    if (hunt.provider && row.provider !== hunt.provider) return false
    if (hunt.priority && row.priority !== hunt.priority) return false
    if (needle && !`${row.issue} ${row.name}`.toLowerCase().includes(needle)) return false
    return true
  })
}

export function copilotBanner(query, rows) {
  if (!rows.length) {
    return `No risks matched “${query}”. Broaden the prompt or clear AI Assistant to restore the full table.`
  }
  const top = rows[0]
  const extra = rows.length > 1 ? ` ${rows.length - 1} additional ${rows.length === 2 ? "finding is" : "findings are"} correlated in the same window.` : ""
  return `AI found ${rows.length} matching ${rows.length === 1 ? "risk" : "risks"}. ${top.name} — ${top.issue} — is driving a +${top.rtoDelta}h RTO delta on ${top.tier} ${top.businessUnit}.${extra}`
}
