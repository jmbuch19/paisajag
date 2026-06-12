'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Sprout } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { AllocationChart } from '@/components/AllocationChart'
import { EmptyState } from '@/components/EmptyState'
import { HealthTag } from '@/components/Tag'
import { rupeesShort } from '@/lib/format'
import { greeting, warmDate } from '@/lib/format'
import { useMemberData } from '@/lib/use-member-data'
import type { Investment } from '@/lib/mock-data'

const FUND_TYPE_GROUP: Record<string, string> = {
  equity_flexicap: 'Equity',
  equity_largecap: 'Equity',
  equity_midcap: 'Equity',
  equity_smallcap: 'Small Cap',
  index: 'Index',
  ppf: 'PPF & Debt',
  epf: 'PPF & Debt',
  fd: 'PPF & Debt',
}

function allocation(investments: Investment[]) {
  const groups = new Map<string, number>()
  for (const inv of investments) {
    const group = FUND_TYPE_GROUP[inv.fundType] ?? 'Other'
    groups.set(group, (groups.get(group) ?? 0) + inv.currentValue)
  }
  return Array.from(groups, ([name, value]) => ({ name, value }))
}

// Net-worth narrative — honest about whichever direction the number points.
function netWorthNote(assets: number, liabilities: number): string {
  if (assets === 0 && liabilities === 0) return ''
  if (liabilities === 0)
    return 'No loans on the books — everything you own works only for you.'
  if (assets > liabilities)
    return 'Your investments have grown past your loans. The gap widens a little every month.'
  return 'Right now your loans are ahead of your investments. Knowing the full picture is the first step — most families never look.'
}

function CheckInCard({ firstName }: { firstName: string }) {
  const searchParams = useSearchParams()
  const [dismissed, setDismissed] = useState(false)
  if (!searchParams.get('check_in') || dismissed) return null
  return (
    <section className="card card-warm">
      <p className="text-gray-900">
        Welcome back{firstName ? `, ${firstName}` : ''}. Before we look at your
        portfolio — did you make any financial changes since we last spoke? New
        investment, withdrawal, SIP started or stopped, any big financial
        decision?
      </p>
      <div className="mt-4 flex gap-3">
        <Link href="/chat" className="btn-primary flex-1">
          Yes, let’s update
        </Link>
        <button className="btn-ghost flex-1" onClick={() => setDismissed(true)}>
          No changes
        </button>
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => setNow(new Date()), [])

  const { loading, member, investments, liabilities } = useMemberData()

  const assets = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalLiabilities = liabilities.reduce(
    (sum, l) => sum + l.outstandingAmount,
    0,
  )
  const net = assets - totalLiabilities
  const firstName = member.fullName.split(' ')[0] ?? ''
  const hasData = investments.length > 0 || liabilities.length > 0
  const note = netWorthNote(assets, totalLiabilities)
  const fundsToReview = [...investments].sort((a, b) =>
    a.health === 'watch' ? -1 : b.health === 'watch' ? 1 : 0,
  )

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <header>
          <h1 className="text-xl font-medium text-gray-900">
            {now ? greeting(now.getHours()) : 'Hello'}
            {firstName && !loading ? `, ${firstName}` : ''} 🌅
          </h1>
          {now && <p className="text-sm text-gray-400">{warmDate(now)}</p>}
        </header>

        <Suspense fallback={null}>
          <CheckInCard firstName={firstName} />
        </Suspense>

        {loading ? (
          <section className="card py-10 text-center text-sm text-gray-400">
            Waking up your money…
          </section>
        ) : !hasData ? (
          <EmptyState
            icon={Sprout}
            message="Your dashboard fills in as you add your investments and loans — at your own pace, one at a time."
            action={
              <Link href="/portfolio" className="btn-primary">
                Add your first investment
              </Link>
            }
          />
        ) : (
          <>
            <section className="card" aria-labelledby="networth-heading">
              <h2
                id="networth-heading"
                className="text-xs font-medium uppercase tracking-wide text-gray-400"
              >
                Net Worth
              </h2>
              <dl className="mt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Assets</dt>
                  <dd className="font-medium tabular-nums">
                    {rupeesShort(assets)}
                  </dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Liabilities</dt>
                  <dd className="font-medium text-red-600 tabular-nums">
                    {rupeesShort(-totalLiabilities)}
                  </dd>
                </div>
                <div className="mt-2 flex justify-between border-t-[0.5px] border-gray-200 pt-2">
                  <dt className="font-medium text-gray-900">Net</dt>
                  <dd
                    className={`text-lg font-medium tabular-nums ${
                      net < 0 ? 'text-red-600' : 'text-teal-600'
                    }`}
                  >
                    {rupeesShort(net)}
                  </dd>
                </div>
              </dl>
              {note && <p className="mt-3 text-sm text-gray-600">{note}</p>}
            </section>

            {investments.length > 0 && (
              <section className="card" aria-labelledby="allocation-heading">
                <h2
                  id="allocation-heading"
                  className="text-xs font-medium uppercase tracking-wide text-gray-400"
                >
                  Portfolio Allocation
                </h2>
                <div className="mt-3">
                  <AllocationChart data={allocation(investments)} />
                </div>
              </section>
            )}

            {investments.length > 0 && (
              <section className="card" aria-labelledby="review-heading">
                {/* "Funds to Review" — never "Needs Attention" (DESIGN.md) */}
                <h2
                  id="review-heading"
                  className="text-xs font-medium uppercase tracking-wide text-gray-400"
                >
                  Funds to Review
                </h2>
                <ul className="mt-3 divide-y divide-gray-100">
                  {fundsToReview.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inv.fundName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {rupeesShort(inv.currentValue)}
                        </p>
                      </div>
                      <HealthTag health={inv.health} />
                    </li>
                  ))}
                </ul>
                <Link
                  href="/portfolio"
                  className="mt-3 block text-sm font-medium text-amber-800"
                >
                  See full portfolio →
                </Link>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}
