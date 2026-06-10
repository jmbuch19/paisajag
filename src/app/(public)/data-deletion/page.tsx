import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/PublicPageShell'

export const metadata: Metadata = { title: 'Data Deletion — PaisaJag' }

export default function DataDeletionPage() {
  return (
    <PublicPageShell title="How to delete your data">
      <p>
        Your data belongs to you, and deleting it is your right under the DPDP
        Act 2023. The process is simple and complete.
      </p>

      <h2 className="text-lg font-medium text-gray-900">From the app</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Open Settings → Delete Account.</li>
        <li>Read what will be deleted, then confirm.</li>
        <li>Type DELETE to confirm a second time.</li>
        <li>You receive a WhatsApp confirmation that the request is logged.</li>
        <li>
          All of your data — profile, portfolio, liabilities, goals, chat
          history, nudge history — is permanently wiped within 30 days.
        </li>
        <li>You receive a final WhatsApp confirmation when it is done.</li>
      </ol>

      <h2 className="text-lg font-medium text-gray-900">Without logging in</h2>
      <p>
        If you can no longer access your account, send a WhatsApp message from
        your registered number to our support number, or email{' '}
        <a
          href="mailto:privacy@paisajag.in"
          className="text-amber-800 underline"
        >
          privacy@paisajag.in
        </a>{' '}
        with the subject “Delete my data”. The same 30-day timeline applies.
      </p>

      <h2 className="text-lg font-medium text-gray-900">What deletion means</h2>
      <p>
        Deletion is permanent and irreversible. We keep no backups of deleted
        member data beyond the deletion window, and nothing is retained for
        marketing or analytics.
      </p>
    </PublicPageShell>
  )
}
