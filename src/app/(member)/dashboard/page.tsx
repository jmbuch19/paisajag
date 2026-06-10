'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/TopBar'
import { AllocationChart } from '@/components/AllocationChart'
import { HealthTag } from '@/components/Tag'
import { rupeesShort } from '@/lib/format'
import { greeting, warmDate } from '@/lib/format'
import {
  mockMember,
  mockInvestments,
  totalAssets,
  totalLiabilities,
  netWorth,
} from '@/lib/mock-data'

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

function allocation() {
  const groups = new Map<string, number>()
  for (const inv of mockInvestments) {
    const group = FUND_TYPE_GROUP[inv.fundType] ?? 'Other'
    groups.set(group, (groups.get(group) ?? 0) + inv.currentValue)
  }
  return Array.from(groups, ([name, value]) => ({ name, value }))
}

function CheckInCard() {
  const searchParams = useSearchParams()
  const [dismissed, setDismissed] = useState(false)
  if (!searchParams.get('check_in') || dismissed) return null
  return (
    <section className="card card-warm">
      <p className="text-gray-900">
        Welcome back, {mockMember.fullName.split(' ')[0]}. Before we look at
        your portfolio — did you make any financial changes since we last
        spoke? New investment, withdrawal, SIP started or stopped, any big
        financial decision?
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

  const assets = totalAssets()
  const liabilities = totalLiabilities()
  const net = netWorth()
  const fundsToReview = [...mockInvestments].sort((a, b) =>
    a.health === 'watch' ? -1 : b.health === 'watch' ? 1 : 0
  )

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <header>
          <h1 className="text-xl font-medium text-gray-900">
            {now ? greeting(now.getHours()) : 'Hello'},{' '}
            {mockMember.fullName.split(' ')[0]} 🌅
          </h1>
          {now && <p className="text-sm text-gray-400">{warmDate(now)}</p>}
        </header>

        <Suspense fallback={null}>
          <CheckInCard />
        </Suspense>

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
              <dd className="font-medium tabular-nums">{rupeesShort(assets)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Liabilities</dt>
              <dd className="font-medium text-red-600 tabular-nums">
                {rupeesShort(-liabilities)}
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
          <p className="mt-3 text-sm text-gray-600">
            Your investments quietly grew past your loans a while ago. The gap
            widens a little every month.
          </p>
        </section>

        <section className="card" aria-labelledby="allocation-heading">
          <h2
            id="allocation-heading"
            className="text-xs font-medium uppercase tracking-wide text-gray-400"
          >
            Portfolio Allocation
          </h2>
          <div className="mt-3">
            <AllocationChart data={allocation()} />
          </div>
        </section>

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
      </main>
    </>
  )
}
