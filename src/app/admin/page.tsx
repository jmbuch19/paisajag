import { mockAdminMetrics as m } from '@/lib/mock-data'

export const metadata = { title: 'Admin — PaisaJag' }

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-medium tabular-nums">{value}</p>
    </div>
  )
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">Platform health</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total members" value={m.totalMembers} />
        <Stat label="Active this week" value={m.activeThisWeek} />
        <Stat label="DNA complete" value={m.dnaCompleteCount} />
        <Stat label="New today" value={m.newSignupsToday} />
        <Stat label="Cost this month" value={`₹${m.totalCostInr.toFixed(0)}`} />
        <Stat
          label="Cost per member"
          value={`₹${m.costPerMemberInr.toFixed(0)}`}
        />
        <Stat label="Briefs delivered" value={m.morningBriefsDelivered} />
        <Stat label="Pending deletions" value={m.pendingDeletions} />
      </div>
      <p className="text-xs text-gray-400">
        Aggregate metrics only. Individual member financial data is never
        visible here — by design.
      </p>
    </div>
  )
}
