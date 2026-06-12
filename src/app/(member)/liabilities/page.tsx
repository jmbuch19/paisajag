'use client'

import { useState } from 'react'
import { Plus, Landmark } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { EmptyState } from '@/components/EmptyState'
import { rupees, rupeesShort, percent } from '@/lib/format'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { useMemberData } from '@/lib/use-member-data'

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

interface FormState {
  liabilityType: string
  lenderName: string
  outstandingAmount: string
  emiAmount: string
  interestRate: string
  remainingTenureMonths: string
}

const EMPTY_FORM: FormState = {
  liabilityType: 'home_loan',
  lenderName: '',
  outstandingAmount: '',
  emiAmount: '',
  interestRate: '',
  remainingTenureMonths: '',
}

function AddLiabilityForm({
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

  const valid = Number(form.outstandingAmount) > 0

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

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
    const { error } = await supabase.from('liabilities').insert({
      user_id: user.id,
      liability_type: form.liabilityType,
      lender_name: form.lenderName.trim() || null,
      outstanding_amount: Number(form.outstandingAmount),
      emi_amount: Number(form.emiAmount) > 0 ? Number(form.emiAmount) : null,
      interest_rate:
        Number(form.interestRate) > 0 ? Number(form.interestRate) : null,
      remaining_tenure_months:
        Number(form.remainingTenureMonths) > 0
          ? Math.round(Number(form.remainingTenureMonths))
          : null,
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
      <h2 className="font-medium text-gray-900">Add a loan or EMI</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="liability-type" className="label">
            Type
          </label>
          <select
            id="liability-type"
            className="input"
            value={form.liabilityType}
            onChange={(e) => set('liabilityType', e.target.value)}
          >
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lender" className="label">
            Lender
          </label>
          <input
            id="lender"
            type="text"
            className="input"
            placeholder="e.g. SBI"
            value={form.lenderName}
            onChange={(e) => set('lenderName', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="outstanding" className="label">
            Outstanding (₹)
          </label>
          <input
            id="outstanding"
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            placeholder="e.g. 1850000"
            value={form.outstandingAmount}
            onChange={(e) => set('outstandingAmount', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="emi" className="label">
            Monthly EMI (₹)
          </label>
          <input
            id="emi"
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            placeholder="Optional"
            value={form.emiAmount}
            onChange={(e) => set('emiAmount', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rate" className="label">
            Interest rate (%)
          </label>
          <input
            id="rate"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            className="input"
            placeholder="Optional"
            value={form.interestRate}
            onChange={(e) => set('interestRate', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tenure" className="label">
            Months remaining
          </label>
          <input
            id="tenure"
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            placeholder="Optional"
            value={form.remainingTenureMonths}
            onChange={(e) => set('remainingTenureMonths', e.target.value)}
          />
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

export default function LiabilitiesPage() {
  const { loading, live, liabilities, refresh } = useMemberData()
  const supabase = getSupabaseBrowser()
  const [adding, setAdding] = useState(false)
  const totalOutstanding = liabilities.reduce(
    (sum, l) => sum + l.outstandingAmount,
    0,
  )

  async function remove(id: string, label: string) {
    if (!supabase) return
    if (!window.confirm(`Remove this ${label.toLowerCase()}?`)) return
    await supabase.from('liabilities').delete().eq('id', id)
    refresh()
  }

  return (
    <>
      <TopBar title="Liabilities" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <section className="card flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Total outstanding</span>
          <span className="text-xl font-medium text-red-600 tabular-nums">
            {rupeesShort(-totalOutstanding)}
          </span>
        </section>
        <p className="text-sm text-gray-600">
          Loans are part of the full picture — net worth only makes sense with
          both sides visible.
        </p>

        {adding && (
          <AddLiabilityForm
            onSaved={() => {
              setAdding(false)
              refresh()
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {loading ? (
          <section className="card py-10 text-center text-sm text-gray-400">
            Loading…
          </section>
        ) : liabilities.length === 0 && !adding ? (
          <EmptyState
            icon={Landmark}
            message="No loans or EMIs recorded. If you have any, adding them completes your net worth picture."
            action={
              <button
                className="btn-primary max-w-xs"
                onClick={() => setAdding(true)}
              >
                Add a loan or EMI
              </button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {liabilities.map((l) => {
              const label = TYPE_LABEL[l.liabilityType] ?? l.liabilityType
              return (
                <li key={l.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-medium text-gray-900">{label}</h2>
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
                  {live && (
                    <button
                      className="mt-2 text-xs text-gray-400 underline"
                      onClick={() => remove(l.id, label)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {!adding && !loading && liabilities.length > 0 && (
          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={() => setAdding(true)}
          >
            <Plus size={18} aria-hidden />
            Add a loan or EMI
          </button>
        )}
      </main>
    </>
  )
}
