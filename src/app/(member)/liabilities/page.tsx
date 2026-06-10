import { Plus, Landmark } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { EmptyState } from '@/components/EmptyState'
import { rupees, rupeesShort, percent } from '@/lib/format'
import { mockLiabilities, totalLiabilities } from '@/lib/mock-data'

export const metadata = { title: 'Liabilities — PaisaJaag' }

const TYPE_LABEL: Record<string, string> = {
  home_loan: 'Home loan',
  car_loan: 'Car loan',
  personal_loan: 'Personal loan',
  education_loan: 'Education loan',
  credit_card: 'Credit card',
  business_loan: 'Business loan',
  gold_loan: 'Gold loan',
  informal: 'Informal loan',
  other: 'Other',
}

export default function LiabilitiesPage() {
  const liabilities = mockLiabilities

  return (
    <>
      <TopBar title="Liabilities" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <section className="card flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Total outstanding</span>
          <span className="text-xl font-medium text-red-600 tabular-nums">
            {rupeesShort(-totalLiabilities())}
          </span>
        </section>
        <p className="text-sm text-gray-600">
          Loans are part of the full picture — net worth only makes sense with
          both sides visible.
        </p>

        {liabilities.length === 0 ? (
          <EmptyState
            icon={Landmark}
            message="No loans or EMIs recorded. If you have any, adding them completes your net worth picture."
          />
        ) : (
          <ul className="space-y-3">
            {liabilities.map((l) => (
              <li key={l.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {TYPE_LABEL[l.liabilityType] ?? l.liabilityType}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {l.lenderName}
                    </p>
                  </div>
                  <span className="font-medium text-red-600 tabular-nums">
                    {rupeesShort(-l.outstandingAmount)}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-gray-400">EMI</dt>
                    <dd className="font-medium tabular-nums">
                      {l.emiAmount ? `${rupees(l.emiAmount)}/mo` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Rate</dt>
                    <dd className="font-medium tabular-nums">
                      {l.interestRate ? percent(l.interestRate) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Remaining</dt>
                    <dd className="font-medium tabular-nums">
                      {l.remainingTenureMonths
                        ? `${Math.round(l.remainingTenureMonths / 12)} yrs`
                        : '—'}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}

        {/* TODO(backend): wire to POST /api/liabilities */}
        <button className="btn-primary flex items-center justify-center gap-2">
          <Plus size={18} aria-hidden />
          Add a loan or EMI
        </button>
      </main>
    </>
  )
}
