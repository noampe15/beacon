import TenantSummaryStrip from "./TenantSummaryStrip"
import LatestAiActivity from "./LatestAiActivity"
import TenantAutonomy from "./TenantAutonomy"
import TimeInQueue from "./TimeInQueue"
import ActionQueueRail from "./ActionQueueRail"
import AnnotationPin from "./AnnotationPin"

export default function TenantOverview({
  overview,
  queueItems,
  selectedId,
  pmNotes,
  onOpenNote,
  onHistory,
  onActivityAction,
  onViewAll,
  onQueueFilter,
  queueHandlers,
}) {
  return (
    <div className="relative space-y-4" data-pin="tenant-layout">
      {pmNotes && <AnnotationPin n={13} noteId={13} onOpen={onOpenNote} className="absolute -left-1 top-0" />}
      <TenantSummaryStrip summary={overview.summary} pmNotes={pmNotes} onOpenNote={onOpenNote} />
      <div className="relative grid items-stretch gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" data-pin="tenant-queue-activity">
        {pmNotes && <AnnotationPin n={12} noteId={12} onOpen={onOpenNote} className="absolute right-2 top-2 z-10" />}
        <div className="order-2 flex min-h-0 min-w-0 lg:order-1">
          <LatestAiActivity
            totals={overview.activityTotals}
            entries={overview.activity}
            periodChip={overview.chipLabel}
            onHistory={onHistory}
            onAction={onActivityAction}
          />
        </div>
        <div className="order-1 flex min-h-0 min-w-0 lg:order-2">
          <ActionQueueRail
            compact
            scope="tenant"
            items={queueItems}
            filterChips={[]}
            onClearFilters={() => {}}
            selectedId={selectedId}
            onViewAll={onViewAll}
            pmNotes={false}
            onOpenNote={onOpenNote}
            totalCount={overview.queue.length}
            {...queueHandlers}
          />
        </div>
      </div>
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <TenantAutonomy autonomy={overview.autonomy} onOpenHistory={onHistory} />
        <TimeInQueue
          buckets={overview.timeInQueue}
          pmNotes={pmNotes}
          onOpenNote={onOpenNote}
          onSegmentClick={onQueueFilter}
        />
      </div>
    </div>
  )
}
