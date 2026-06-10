import { Plus, Target } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { EmptyState } from '@/components/EmptyState'
import { rupeesShort, percent } from '@/lib/format'
import { mockGoals } from '@/lib/mock-data'

export const metadata = { title: 'Goals — PaisaJag' }

export default function GoalsPage() {
  const goals = mockGoals

  return (
    <>
      <TopBar title="Goals" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            message="Goals give your investments a purpose. Want to add one?"
            action={<button className="btn-primary max-w-xs">Add a goal</button>}
          />
        ) : (
          <ul className="space-y-3">
            {goals.map((g) => {
              const progress = Math.min(
                (g.currentSavings / g.targetAmount) * 100,
                100
              )
              const targetYear = new Date(g.targetDate).getFullYear()
              return (
                <li key={g.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-medium text-gray-900">{g.goalName}</h2>
                    <span className="text-xs text-gray-400">{targetYear}</span>
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
                </li>
              )
            })}
          </ul>
        )}

        {/* TODO(backend): wire to POST /api/goals */}
        <button className="btn-primary flex items-center justify-center gap-2">
          <Plus size={18} aria-hidden />
          Add a goal
        </button>
      </main>
    </>
  )
}
