import { mockAdminMetrics as m } from '@/lib/mock-data'

export const metadata = { title: 'Nudges — PaisaJag Admin' }

export default function AdminNudgesPage() {
  const deliveryRate = (
    (m.morningBriefsDelivered / m.morningBriefsSent) *
    100
  ).toFixed(1)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">Nudge performance</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-gray-400">Morning briefs sent</p>
          <p className="mt-1 text-xl font-medium tabular-nums">
            {m.morningBriefsSent}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Delivery rate</p>
          <p className="mt-1 text-xl font-medium tabular-nums">
            {deliveryRate}%
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Evening alerts sent</p>
          <p className="mt-1 text-xl font-medium tabular-nums">
            {m.eveningAlertsSent}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Blocked by silence filter</p>
          <p className="mt-1 text-xl font-medium tabular-nums">
            {m.silenceFilterBlocked}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        A high silence-filter count is healthy — every blocked alert is nudge
        fatigue avoided.
      </p>
    </div>
  )
}
