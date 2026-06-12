import { getSupabaseAdmin } from '@/lib/supabase/server'
import { mockAdminMetrics } from '@/lib/mock-data'

export const metadata = { title: 'Admin — PaisaJag' }
export const dynamic = 'force-dynamic'

interface Metrics {
  totalMembers: number
  activeThisWeek: number
  dnaCompleteCount: number
  newSignupsToday: number
  totalCostInr: number
  costPerMemberInr: number
  morningBriefsDelivered: number
  pendingDeletions: number
}

// Aggregate counts only — no member rows are ever selected here.
async function loadMetrics(): Promise<{ metrics: Metrics; live: boolean }> {
  const admin = getSupabaseAdmin()
  if (!admin) return { metrics: mockAdminMetrics, live: false }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  const [members, active, dnaDone, newToday, briefs, deletions, costs] =
    await Promise.all([
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login_at', weekAgo),
      admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('dna_complete', true),
      admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),
      admin
        .from('nudge_log')
        .select('*', { count: 'exact', head: true })
        .eq('nudge_type', 'morning_brief')
        .eq('delivered', true),
      admin
        .from('deletion_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      admin
        .from('api_usage')
        .select('cost_inr')
        .gte('recorded_at', monthStart.toISOString()),
    ])

  const totalMembers = members.count ?? 0
  const totalCostInr = (costs.data ?? []).reduce(
    (sum, r) => sum + Number(r.cost_inr ?? 0),
    0,
  )

  return {
    live: true,
    metrics: {
      totalMembers,
      activeThisWeek: active.count ?? 0,
      dnaCompleteCount: dnaDone.count ?? 0,
      newSignupsToday: newToday.count ?? 0,
      totalCostInr,
      costPerMemberInr: totalMembers > 0 ? totalCostInr / totalMembers : 0,
      morningBriefsDelivered: briefs.count ?? 0,
      pendingDeletions: deletions.count ?? 0,
    },
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-medium tabular-nums">{value}</p>
    </div>
  )
}

export default async function AdminOverviewPage() {
  const { metrics: m, live } = await loadMetrics()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">Platform health</h1>
      {!live && (
        <p className="text-xs text-amber-800">
          Preview data — Supabase not configured.
        </p>
      )}
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
