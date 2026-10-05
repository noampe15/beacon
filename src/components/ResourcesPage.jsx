import { Box, Database, HardDrive, Network, Server, Wrench } from "lucide-react"
import { affectsNote } from "../data"
import { ProviderBadge, ScoreRing, SeverityBadge } from "./Badges"

const typeIcons = {
  db: Database,
  vm: Server,
  k8s: Box,
  storage: HardDrive,
  net: Network,
}

function groupByResource(rows) {
  const map = new Map()
  for (const row of rows) {
    if (!map.has(row.name)) {
      map.set(row.name, { ...row, issues: [] })
    }
    const group = map.get(row.name)
    if (!group.issues.some((issue) => issue.issue === row.issue)) {
      group.issues.push(row)
    }
  }
  return [...map.values()].map((group) => ({
    ...group,
    score: Math.max(...group.issues.map((i) => i.score)),
  }))
}

export default function ResourcesPage({ rows, onRemediate }) {
  const groups = groupByResource(rows)

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold">Resources</h2>
        <span className="text-[12px] text-slate-400">{groups.length} assets</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const Icon = typeIcons[group.icon] ?? Database
          return (
            <div key={group.name} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold">{group.name}</p>
                    <p className="text-[11px] text-slate-400">{group.type}</p>
                  </div>
                </div>
                <ScoreRing score={group.score} size={36} />
              </div>
              <ul className="mt-3 space-y-2">
                {group.issues.map((issue) => {
                  const note = affectsNote(issue.relatedResources)
                  return (
                    <li key={issue.id} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] text-slate-700">{issue.issue}</p>
                        {note ? (
                          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{note}</p>
                        ) : null}
                        <div className="mt-1 flex items-center gap-2">
                          <ProviderBadge provider={issue.provider} />
                          <SeverityBadge severity={issue.priority} />
                          {(issue.relatedResources?.length ?? 0) > 0 && (
                            <span className="text-[11px] font-medium text-[#6d5cff]">
                              Shared · {issue.relatedResources.length + 1}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemediate(issue)}
                        className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                        aria-label={`Open remediation for ${issue.issue}`}
                      >
                        <Wrench className="h-4 w-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
