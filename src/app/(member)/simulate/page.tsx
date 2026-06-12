'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { DisclaimerBlock } from '@/components/DisclaimerBlock'
import { sipCorpus, lumpsumCorpus } from '@/lib/simulate'
import { roundForDisplay, rupeesShort } from '@/lib/format'
import {
  DEFAULT_CAGR,
  SIMULATION_ASSUMPTION_NOTE,
} from '@/lib/constants'
import { useMemberData } from '@/lib/use-member-data'

type Scenario = 'sip_change' | 'lumpsum'

export default function SimulatePage() {
  const { loading, investments } = useMemberData()
  // BEFORE state always comes from the member's real portfolio (SPEC.md)
  const currentMonthlySip = investments.reduce(
    (sum, inv) => sum + (inv.monthlySip ?? 0),
    0,
  )
  const [scenario, setScenario] = useState<Scenario>('sip_change')
  const [newSip, setNewSip] = useState(5000)
  const [lumpsum, setLumpsum] = useState(100_000)
  const [years, setYears] = useState(10)

  useEffect(() => {
    if (!loading) setNewSip(currentMonthlySip + 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // BEFORE state always comes from the current portfolio (SPEC.md)
  const before = sipCorpus(currentMonthlySip, years, DEFAULT_CAGR)
  const after =
    scenario === 'sip_change'
      ? sipCorpus(newSip, years, DEFAULT_CAGR)
      : before + lumpsumCorpus(lumpsum, years, DEFAULT_CAGR)
  const difference = after - before

  return (
    <>
      <TopBar title="Simulate" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <p className="text-sm text-gray-600">
          Try a decision here before you make it anywhere. Numbers, not advice
          — the choice stays yours.
        </p>

        <div className="flex gap-2" role="tablist" aria-label="Scenario type">
          {(
            [
              ['sip_change', 'Change my SIP'],
              ['lumpsum', 'Add a lumpsum'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={scenario === value}
              onClick={() => setScenario(value)}
              className={`min-h-[44px] flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                scenario === value
                  ? 'border-amber-800 bg-amber-800 text-white'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <section className="card space-y-4">
          {scenario === 'sip_change' ? (
            <div>
              <label htmlFor="sip" className="label">
                New total monthly SIP (currently{' '}
                {rupeesShort(currentMonthlySip)}/month)
              </label>
              <input
                id="sip"
                type="number"
                min={0}
                step={500}
                className="input"
                value={newSip}
                onChange={(e) => setNewSip(Number(e.target.value))}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="lumpsum" className="label">
                One-time amount to invest
              </label>
              <input
                id="lumpsum"
                type="number"
                min={0}
                step={10_000}
                className="input"
                value={lumpsum}
                onChange={(e) => setLumpsum(Number(e.target.value))}
              />
            </div>
          )}
          <div>
            <label htmlFor="years" className="label">
              Over how many years? ({years})
            </label>
            <input
              id="years"
              type="range"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-amber-800"
            />
          </div>
        </section>

        <section className="card card-warm" aria-live="polite">
          <h2 className="text-xs font-medium uppercase tracking-wide text-amber-800">
            Before / After — {years} years
          </h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">As things are today</dt>
              <dd className="font-medium tabular-nums">
                {rupeesShort(roundForDisplay(before))}*
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">With this change</dt>
              <dd className="font-medium tabular-nums">
                {rupeesShort(roundForDisplay(after))}*
              </dd>
            </div>
            <div className="flex justify-between border-t-[0.5px] border-amber-400 pt-2">
              <dt className="text-sm font-medium text-gray-900">Difference</dt>
              <dd
                className={`font-medium tabular-nums ${
                  difference < 0 ? 'text-red-600' : 'text-teal-600'
                }`}
              >
                {difference >= 0 ? '+' : ''}
                {rupeesShort(roundForDisplay(difference))}*
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-gray-600">
            *{SIMULATION_ASSUMPTION_NOTE}
          </p>
        </section>

        {/* TODO(backend): POST /api/simulate/* to save + add Claude commentary */}
        <DisclaimerBlock />
      </main>
    </>
  )
}
