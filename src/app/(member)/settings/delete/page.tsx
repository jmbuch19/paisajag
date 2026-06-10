'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/TopBar'

// Deletion flow — SPEC.md Flow 7. Two confirmations, the second typed.
export default function DeleteAccountPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'explain' | 'confirm' | 'done'>('explain')
  const [typed, setTyped] = useState('')

  function submit() {
    // TODO(backend): POST /api/account/delete — logs request,
    // sends WhatsApp confirmation, wipes within 30 days.
    setStage('done')
  }

  return (
    <>
      <TopBar title="Delete Account" showBack />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {stage === 'explain' && (
          <>
            <section className="card space-y-3">
              <h1 className="text-lg font-medium text-gray-900">
                What deletion means
              </h1>
              <p className="text-sm text-gray-600">
                Everything goes — your profile, Financial DNA, portfolio,
                liabilities, goals, chat history and nudge history. Wiped
                permanently within 30 days, with WhatsApp confirmation when
                done.
              </p>
              <p className="text-sm text-gray-600">
                This cannot be undone. There is no archive, no backup, no way
                back — that’s the point.
              </p>
              <p className="text-sm text-gray-600">
                If you’d rather take a break, you can simply turn off nudges in
                Settings — your data stays untouched until you return.
              </p>
            </section>
            <button
              className="btn-primary !bg-red-600"
              onClick={() => setStage('confirm')}
            >
              I understand — continue
            </button>
            <button className="btn-ghost" onClick={() => router.back()}>
              Keep my account
            </button>
          </>
        )}

        {stage === 'confirm' && (
          <>
            <section className="card space-y-3">
              <h1 className="text-lg font-medium text-gray-900">
                One last confirmation
              </h1>
              <p className="text-sm text-gray-600">
                Type <span className="font-medium text-gray-900">DELETE</span>{' '}
                below to confirm you want everything permanently removed.
              </p>
              <input
                className="input text-center tracking-widest"
                value={typed}
                onChange={(e) => setTyped(e.target.value.toUpperCase())}
                aria-label="Type DELETE to confirm"
              />
            </section>
            <button
              className="btn-primary !bg-red-600"
              disabled={typed !== 'DELETE'}
              onClick={submit}
            >
              Permanently delete everything
            </button>
            <button className="btn-ghost" onClick={() => router.back()}>
              Cancel
            </button>
          </>
        )}

        {stage === 'done' && (
          <section className="card space-y-3 text-center">
            <h1 className="text-lg font-medium text-gray-900">
              Your request is logged
            </h1>
            <p className="text-sm text-gray-600">
              You’ll receive a WhatsApp confirmation shortly. All data will be
              wiped within 30 days, and we’ll confirm again when it’s done.
            </p>
            <p className="text-sm text-gray-600">
              Thank you for trusting us with your money’s story, even briefly.
              Go well.
            </p>
          </section>
        )}
      </main>
    </>
  )
}
