'use client'

import { useEffect, useState } from 'react'
import { Plus, Wallet, Link2 } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { HealthTag } from '@/components/Tag'
import { Tag } from '@/components/Tag'
import { EmptyState } from '@/components/EmptyState'
import { rupees, rupeesShort, percent } from '@/lib/format'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { useMemberData } from '@/lib/use-member-data'

const FUND_TYPE_OPTIONS: [string, string][] = [
  ['equity_largecap', 'Equity — Large Cap'],
  ['equity_midcap', 'Equity — Mid Cap'],
  ['equity_smallcap', 'Equity — Small Cap'],
  ['equity_flexicap', 'Equity — Flexi Cap'],
  ['equity_elss', 'Equity — ELSS (Tax Saver)'],
  ['equity_sectoral', 'Equity — Sectoral'],
  ['index', 'Index Fund'],
  ['debt_liquid', 'Debt — Liquid'],
  ['debt_shortterm', 'Debt — Short Term'],
  ['debt_longterm', 'Debt — Long Term'],
  ['hybrid_balanced', 'Hybrid — Balanced'],
  ['hybrid_aggressive', 'Hybrid — Aggressive'],
  ['gold_etf', 'Gold ETF'],
  ['international', 'International'],
  ['fd', 'Fixed Deposit'],
  ['ppf', 'PPF'],
  ['epf', 'EPF'],
  ['nps', 'NPS'],
  ['gold_physical', 'Physical Gold'],
  ['real_estate', 'Real Estate'],
  ['stocks', 'Stocks'],
  ['other', 'Other'],
]

interface FormState {
  fundName: string
  fundType: string
  investedAmount: string
  currentValue: string
  monthlySip: string
  planType: string
}

const EMPTY_FORM: FormState = {
  fundName: '',
  fundType: 'equity_flexicap',
  investedAmount: '',
  currentValue: '',
  monthlySip: '',
  planType: 'unknown',
}

interface FundSuggestion {
  schemeCode: number
  schemeName: string
}

function AddInvestmentForm({
  onSaved,
  onCancel,
}: {
  onSaved: () => void
  onCancel: () => void
}) {
  const supabase = getSupabaseBrowser()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<FundSuggestion[]>([])
  const [linked, setLinked] = useState<FundSuggestion | null>(null)

  const valid =
    form.fundName.trim().length > 0 && Number(form.currentValue) > 0

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Live fund search (mfapi.in via our proxy) — linking a scheme enables
  // daily NAV auto-updates for this investment.
  useEffect(() => {
    const q = form.fundName.trim()
    if (linked || q.length < 4) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/funds/search?q=${encodeURIComponent(q)}`)
        if (res.ok) setSuggestions(await res.json())
      } catch {
        setSuggestions([])
      }
    }, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fundName, linked])

  async function save() {
    setError(null)
    if (!supabase) {
      onCancel()
      return
    }
    setBusy(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setBusy(false)
      setError('Your session expired — please log in again.')
      return
    }
    const sip = Number(form.monthlySip)
    const invested = Number(form.investedAmount)
    const currentValue = Number(form.currentValue)

    // If linked to a live scheme, derive units from today's NAV so the
    // daily cron can keep current_value fresh.
    let navFields = {}
    if (linked) {
      try {
        const res = await fetch(`/api/funds/${linked.schemeCode}`)
        if (res.ok) {
          const { nav, fundHouse } = await res.json()
          navFields = {
            scheme_code: String(linked.schemeCode),
            amc_name: fundHouse ?? null,
            units: Math.round((currentValue / nav) * 10000) / 10000,
            last_nav: nav,
            nav_updated_at: new Date().toISOString(),
          }
        }
      } catch {
        // save without the link — member can re-add later
      }
    }

    const { error } = await supabase.from('investments').insert({
      user_id: user.id,
      fund_name: form.fundName.trim(),
      fund_type: form.fundType,
      investment_mode: sip > 0 ? (invested > 0 ? 'both' : 'sip') : 'lumpsum',
      invested_amount: invested > 0 ? invested : null,
      current_value: currentValue,
      monthly_sip_amount: sip > 0 ? sip : null,
      plan_type: form.planType,
      ...navFields,
    })
    setBusy(false)
    if (error) {
      setError('We couldn’t save that. Please check the values and try again.')
      return
    }
    onSaved()
  }

  return (
    <section className="card space-y-4">
      <h2 className="font-medium text-gray-900">Add an investment</h2>
      <div className="relative">
        <label htmlFor="fund-name" className="label">
          Name (fund, scheme or asset)
        </label>
        <input
          id="fund-name"
          type="text"
          className="input"
          placeholder="e.g. HDFC Flexi Cap Fund"
          value={form.fundName}
          autoComplete="off"
          onChange={(e) => {
            set('fundName', e.target.value)
            setLinked(null)
          }}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {suggestions.map((s) => (
              <li key={s.schemeCode}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-amber-50"
                  onClick={() => {
                    set('fundName', s.schemeName)
                    setLinked(s)
                    setSuggestions([])
                  }}
                >
                  {s.schemeName}
                </button>
              </li>
            ))}
          </ul>
        )}
        {linked ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-teal-600">
            <Link2 size={12} aria-hidden />
            Linked — value updates automatically with daily NAV
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-400">
            Pick a suggestion to enable automatic daily NAV updates (mutual
            funds only) — or just type any asset name.
          </p>
        )}
      </div>
      <div>
        <label htmlFor="fund-type" className="label">
          Type
        </label>
        <select
          id="fund-type"
          className="input"
          value={form.fundType}
          onChange={(e) => set('fundType', e.target.value)}
        >
          {FUND_TYPE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="invested" className="label">
            Total invested (₹)
          </label>
          <input
            id="invested"
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            placeholder="Optional"
            value={form.investedAmount}
            onChange={(e) => set('investedAmount', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="current" className="label">
            Current value (₹)
          </label>
          <input
            id="current"
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            placeholder="e.g. 250000"
            value={form.currentValue}
            onChange={(e) => set('currentValue', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="sip" className="label">
            Monthly SIP (₹)
          </label>
          <input
            id="sip"
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            placeholder="0 if none"
            value={form.monthlySip}
            onChange={(e) => set('monthlySip', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="plan-type" className="label">
            Plan type
          </label>
          <select
            id="plan-type"
            className="input"
            value={form.planType}
            onChange={(e) => set('planType', e.target.value)}
          >
            <option value="unknown">Not sure</option>
            <option value="direct">Direct</option>
            <option value="regular">Regular</option>
          </select>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button className="btn-ghost flex-1" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button
          className="btn-primary flex-1"
          onClick={save}
          disabled={!valid || busy}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </section>
  )
}

export default function PortfolioPage() {
  const { loading, live, investments, refresh } = useMemberData()
  const supabase = getSupabaseBrowser()
  const [adding, setAdding] = useState(false)
  const totalValue = investments.reduce((sum, i) => sum + i.currentValue, 0)

  async function remove(id: string, fundName: string) {
    if (!supabase) return
    if (!window.confirm(`Remove ${fundName} from your portfolio?`)) return
    await supabase.from('investments').delete().eq('id', id)
    refresh()
  }

  return (
    <>
      <TopBar title="Portfolio" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <section className="card card-warm flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Total value</span>
          <span className="text-xl font-medium tabular-nums">
            {rupeesShort(totalValue)}
          </span>
        </section>

        {adding && (
          <AddInvestmentForm
            onSaved={() => {
              setAdding(false)
              refresh()
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {loading ? (
          <section className="card py-10 text-center text-sm text-gray-400">
            Loading your portfolio…
          </section>
        ) : investments.length === 0 && !adding ? (
          <EmptyState
            icon={Wallet}
            message="Your portfolio is empty for now. Add your first investment to get started."
            action={
              <button
                className="btn-primary max-w-xs"
                onClick={() => setAdding(true)}
              >
                Add an investment
              </button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {investments.map((inv) => {
              const hasInvested = inv.investedAmount > 0
              const gain = inv.currentValue - inv.investedAmount
              const gainPct = hasInvested
                ? (gain / inv.investedAmount) * 100
                : 0
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
                    {inv.healthNote && <HealthTag health={inv.health} />}
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-gray-400">Invested</dt>
                      <dd className="font-medium tabular-nums">
                        {hasInvested ? rupeesShort(inv.investedAmount) : '—'}
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
                        {hasInvested
                          ? `${gain < 0 ? '' : '+'}${percent(gainPct)}`
                          : '—'}
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
                  {inv.healthNote && (
                    <p className="mt-2 text-xs text-gray-600">
                      {inv.healthNote}
                    </p>
                  )}
                  {live && (
                    <button
                      className="mt-2 text-xs text-gray-400 underline"
                      onClick={() => remove(inv.id, inv.fundName)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {!adding && !loading && investments.length > 0 && (
          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={() => setAdding(true)}
          >
            <Plus size={18} aria-hidden />
            Add an investment
          </button>
        )}
      </main>
    </>
  )
}
