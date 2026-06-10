import { mockAdminMetrics as m } from '@/lib/mock-data'

export const metadata = { title: 'Costs — PaisaJag Admin' }

export default function AdminCostsPage() {
  const rows = [
    { service: 'Claude API', cost: m.claudeCostInr },
    { service: 'Perplexity API', cost: m.perplexityCostInr },
    { service: 'WhatsApp (Meta)', cost: m.whatsappCostInr },
  ]
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">
        API costs this month
      </h1>
      <div className="card p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-[0.5px] border-gray-200 text-xs text-gray-400">
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 text-right font-medium">Cost (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.service}>
                <td className="px-5 py-3 text-gray-900">{row.service}</td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {row.cost.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-5 py-3 font-medium text-gray-900">Total</td>
              <td className="px-5 py-3 text-right font-medium tabular-nums">
                {m.totalCostInr.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">
        ₹{m.costPerMemberInr.toFixed(2)} per member. Founder absorbs costs for
        the first 6 months; billing activates Month 7.
      </p>
    </div>
  )
}
