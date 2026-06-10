import { Plus, Wallet } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { HealthTag } from '@/components/Tag'
import { Tag } from '@/components/Tag'
import { EmptyState } from '@/components/EmptyState'
import { rupees, rupeesShort, percent } from '@/lib/format'
import { mockInvestments, totalAssets } from '@/lib/mock-data'

export const metadata = { title: 'Portfolio — PaisaJag' }

export default function PortfolioPage() {
  const investments = mockInvestments

  return (
    <>
      <TopBar title="Portfolio" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <section className="card card-warm flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Total value</span>
          <span className="text-xl font-medium tabular-nums">
            {rupeesShort(totalAssets())}
          </span>
        </section>

        {investments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            message="Your portfolio is empty for now. Add your first investment to get started."
            action={
              <button className="btn-primary max-w-xs">
                Add an investment
              </button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {investments.map((inv) => {
              const gain = inv.currentValue - inv.investedAmount
              const gainPct = (gain / inv.investedAmount) * 100
              return (
                <li key={inv.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-medium text-gray-900">
                        {inv.fundName}
                      </h2>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {inv.monthlySip
                          ? `SIP ${rupees(inv.monthlySip)}/month`
                          : 'Lumpsum'}
                      </p>
                    </div>
                    <HealthTag health={inv.health} />
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-gray-400">Invested</dt>
                      <dd className="font-medium tabular-nums">
                        {rupeesShort(inv.investedAmount)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Current</dt>
                      <dd className="font-medium tabular-nums">
                        {rupeesShort(inv.currentValue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Gain</dt>
                      <dd
                        className={`font-medium tabular-nums ${
                          gain < 0 ? 'text-red-600' : 'text-teal-600'
                        }`}
                      >
                        {gain < 0 ? '' : '+'}
                        {percent(gainPct)}
                      </dd>
                    </div>
                  </dl>
                  {inv.planType === 'regular' && (
                    <div className="mt-3">
                      <Tag variant="info">Regular plan</Tag>
                      <p className="mt-1.5 text-xs text-gray-400">
                        A direct plan of the same fund typically has a 1–1.5%
                        lower expense ratio. Worth knowing — the choice is
                        yours.
                      </p>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-600">{inv.healthNote}</p>
                </li>
              )
            })}
          </ul>
        )}

        {/* TODO(backend): wire to POST /api/investments */}
        <button className="btn-primary flex items-center justify-center gap-2">
          <Plus size={18} aria-hidden />
          Add an investment
        </button>
      </main>
    </>
  )
}
