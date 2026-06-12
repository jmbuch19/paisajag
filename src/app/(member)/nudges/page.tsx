'use client'

import { Sunrise, Moon, Trophy, BellOff } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { EmptyState } from '@/components/EmptyState'
import { useMemberData } from '@/lib/use-member-data'

const NUDGE_META = {
  morning_brief: { icon: Sunrise, label: 'Morning brief' },
  evening_alert: { icon: Moon, label: 'Evening alert' },
  goal_milestone: { icon: Trophy, label: 'Goal milestone' },
} as const

export default function NudgesPage() {
  const { loading, nudges } = useMemberData()

  return (
    <>
      <TopBar title="Nudge History" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {loading ? (
          <section className="card py-10 text-center text-sm text-gray-400">
            Loading…
          </section>
        ) : nudges.length === 0 ? (
          <EmptyState
            icon={BellOff}
            message="Your morning briefs will appear here once WhatsApp nudges go live."
          />
        ) : (
          <ul className="space-y-3">
            {nudges.map((nudge) => {
              const meta = NUDGE_META[nudge.nudgeType]
              if (!meta) return null
              const { icon: Icon, label } = meta
              const delivered = new Date(nudge.deliveredAt)
              return (
                <li key={nudge.id} className="card">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-amber-600" aria-hidden />
                    <span className="text-sm font-medium text-gray-900">
                      {label}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      {delivered.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      ,{' '}
                      {delivered.toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {nudge.content}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
        <p className="text-center text-xs text-gray-400">
          Quiet days have no entries — silence is a feature, not a failure.
        </p>
      </main>
    </>
  )
}
