'use client'

import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { EmptyState } from '@/components/EmptyState'
import { rupeesShort, percent } from '@/lib/format'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { useMemberData } from '@/lib/use-member-data'

const GOAL_TYPE_OPTIONS: [string, string][] = [
  ['retirement', 'Retirement'],
  ['education', 'Education'],
  ['marriage', 'Marriage'],
  ['home', 'Home'],
  ['vehicle', 'Vehicle'],
  ['emergency_fund', 'Emergency fund'],
  ['travel', 'Travel'],
  ['medical', 'Medical'],
  ['other', 'Other'],
]

interface FormState {
  goalName: string
  goalType: string
  targetAmount: string
  targetYear: string
  currentSavings: string
  monthlyContribution: string
}

const EMPTY_FORM: FormState = {
  goalName: '',
  goalType: 'education',
  targetAmount: '',
  targetYear: '',
  currentSavings: '',
  monthlyContribution: '',
}

function AddGoalForm({
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

  const yearNum = Number(form.targetYear)
  const valid =
    form.goalName.trim().length > 0 &&
    Number(form.targetAmount) > 0 &&
    yearNum >= new Date().getFullYear() &&
    yearNum <= 2100

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
    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      goal_name: form.goalName.trim(),
      goal_type: form.goalType,
      target_amount: Number(form.targetAmount),
      target_date: `${form.targetYear}-01-01`,
      current_savings:
        Number(form.currentSavings) > 0 ? Number(form.currentSavings) : 0,
      monthly_contribution:
        Number(form.monthlyContribution) > 0
          ? Number(form.monthlyContribution)
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
      <h2 className="font-medium text-gray-900">Add a goal</h2>
      <div>
        <label htmlFor="goal-name" className="label">
          What is this goal for?
        </label>
        <input
          id="goal-name"
          type="text"
          className="input"
          placeholder="e.g. Meera’s education"
          value={form.goalName}
          onChange={(e) => set('goalName', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="goal-type" className="label">
            Type
          </label>
          <select
            id="goal-type"
            className="input"
            value={form.goalType}
            onChange={(e) => set('goalType', e.target.value)}
          >
            {GOAL_TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="target-year" className="label">
            Target year
          </label>
          <input
            id="target-year"
            type="number"
            inputMode="numeric"
            min={new Date().getFullYear()}
            max="2100"
            className="input"
            placeholder="e.g. 2032"
            value={form.targetYear}
            onChange={(e) => set('targetYear', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="target-amount" className="label">
            Target amount (₹)
          </label>
          <input
            id="target-amount"
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            placeholder="e.g. 2500000"
            value={form.targetAmount}
            onChange={(e) => set('targetAmount', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="current-savings" className="label">
            Saved so far (₹)
          </label>
          <input
            id="current-savings"
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            placeholder="0"
            value={form.currentSavings}
            onChange={(e) => set('currentSavings', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="monthly-contribution" className="label">
          Monthly contribution (₹)
        </label>
        <input
          id="monthly-contribution"
          type="number"
          inputMode="numeric"
          min="0"
          className="input"
          placeholder="Optional"
          value={form.monthlyContribution}
          onChange={(e) => set('monthlyContribution', e.target.value)}
        />
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

export default function GoalsPage() {
  const { loading, live, goals, refresh } = useMemberData()
  const supabase = getSupabaseBrowser()
  const [adding, setAdding] = useState(false)

  async function remove(id: string, name: string) {
    if (!supabase) return
    if (!window.confirm(`Remove the goal “${name}”?`)) return
    await supabase.from('goals').delete().eq('id', id)
    refresh()
  }

  return (
    <>
      <TopBar title="Goals" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {adding && (
          <AddGoalForm
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
        ) : goals.length === 0 && !adding ? (
          <EmptyState
            icon={Target}
            message="Goals give your investments a purpose. Want to add one?"
            action={
              <button
                className="btn-primary max-w-xs"
                onClick={() => setAdding(true)}
              >
                Add a goal
              </button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {goals.map((g) => {
              const progress = Math.min(
                (g.currentSavings / g.targetAmount) * 100,
                100,
              )
              const targetYear = g.targetDate
                ? new Date(g.targetDate).getFullYear()
                : null
              return (
                <li key={g.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-medium text-gray-900">{g.goalName}</h2>
                    {targetYear && (
                      <span className="text-xs text-gray-400">
                        {targetYear}
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${g.goalName} progress`}
                  >
                    <div
                      className="h-full rounded-full bg-teal-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900 tabular-nums">
                      {rupeesShort(g.currentSavings)}
                    </span>{' '}
                    of {rupeesShort(g.targetAmount)} — {percent(progress)} there
                  </p>
                  {g.monthlyContribution && (
                    <p className="mt-1 text-xs text-gray-400">
                      {rupeesShort(g.monthlyContribution)}/month flowing in
                      quietly.
                    </p>
                  )}
                  {live && (
                    <button
                      className="mt-2 text-xs text-gray-400 underline"
                      onClick={() => remove(g.id, g.goalName)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {!adding && !loading && goals.length > 0 && (
          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={() => setAdding(true)}
          >
            <Plus size={18} aria-hidden />
            Add a goal
          </button>
        )}
      </main>
    </>
  )
}
