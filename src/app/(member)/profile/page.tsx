import Link from 'next/link'
import { Settings, Pencil } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { Tag } from '@/components/Tag'
import { mockMember } from '@/lib/mock-data'

export const metadata = { title: 'Profile — PaisaJag' }

const LIFE_STAGE_LABEL: Record<string, string> = {
  early_career: 'Early career',
  mid_career: 'Mid career',
  pre_retirement: 'Pre-retirement',
  retired: 'Retired',
}

export default function ProfilePage() {
  const member = mockMember

  return (
    <>
      <TopBar title="Profile" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <section className="card flex items-center gap-4">
          <span
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-xl font-medium text-amber-800"
          >
            {member.fullName
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </span>
          <div>
            <h1 className="text-lg font-medium text-gray-900">
              {member.fullName}
            </h1>
            <p className="text-sm text-gray-400">
              {member.phone} · {member.city}
            </p>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Your Financial DNA
            </h2>
            {/* TODO(backend): edit flow updates profiles table */}
            <button
              className="flex items-center gap-1 text-sm font-medium text-amber-800"
              aria-label="Edit Financial DNA"
            >
              <Pencil size={14} aria-hidden /> Edit
            </button>
          </div>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Life stage</dt>
              <dd>
                <Tag variant="info">
                  {LIFE_STAGE_LABEL[member.lifeStage] ?? member.lifeStage}
                </Tag>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Risk temperament</dt>
              <dd>
                <Tag variant="neutral">
                  {member.riskProfile === 'moderate'
                    ? 'Moderate'
                    : member.riskProfile}
                </Tag>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Age</dt>
              <dd className="font-medium text-gray-900">{member.age}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-gray-400">
            This profile shapes every brief, every chat response and every
            simulation — so they fit you, not a generic investor.
          </p>
        </section>

        <nav className="card divide-y divide-gray-100">
          <Link
            href="/goals"
            className="flex min-h-[44px] items-center py-3 text-gray-900"
          >
            Goals
          </Link>
          <Link
            href="/liabilities"
            className="flex min-h-[44px] items-center py-3 text-gray-900"
          >
            Liabilities
          </Link>
          <Link
            href="/nudges"
            className="flex min-h-[44px] items-center py-3 text-gray-900"
          >
            Nudge history
          </Link>
          <Link
            href="/settings"
            className="flex min-h-[44px] items-center gap-2 py-3 text-gray-900"
          >
            <Settings size={16} className="text-gray-400" aria-hidden />
            Settings
          </Link>
        </nav>
      </main>
    </>
  )
}
