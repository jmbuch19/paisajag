'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/TopBar'
import { mockMember } from '@/lib/mock-data'

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-4 py-3">
      <div>
        <p className="text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-teal-400' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  // TODO(backend): persist via POST /api/nudges/preferences
  const [morning, setMorning] = useState(true)
  const [evening, setEvening] = useState(true)

  return (
    <>
      <TopBar title="Settings" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <section className="card">
          <h2 className="text-xs font-medium uppercase tracking-wide text-gray-400">
            WhatsApp Nudges
          </h2>
          <div className="mt-2 divide-y divide-gray-100">
            <Toggle
              label="Morning brief"
              description="Every day at 6:30am — your world, your portfolio."
              checked={morning}
              onChange={setMorning}
            />
            <Toggle
              label="Evening alerts"
              description="Only when something material affects your funds."
              checked={evening}
              onChange={setEvening}
            />
          </div>
        </section>

        <section className="card">
          <h2 className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Account
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">WhatsApp number</dt>
              <dd className="font-medium text-gray-900">{mockMember.phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Plan</dt>
              <dd className="font-medium text-gray-900">
                Complimentary — first 6 months
              </dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2 className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Your Data
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Everything here belongs to you. You can delete all of it,
            permanently, whenever you choose.
          </p>
          <Link
            href="/settings/delete"
            className="mt-3 block text-sm font-medium text-red-600"
          >
            Delete my account and data →
          </Link>
        </section>

        {/* TODO(backend): supabase.auth.signOut() */}
        <button className="btn-ghost">Sign out</button>
      </main>
    </>
  )
}
