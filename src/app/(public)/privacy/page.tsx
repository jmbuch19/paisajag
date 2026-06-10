import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/PublicPageShell'
import { LEGAL_DOCUMENT_VERSION } from '@/lib/constants'

export const metadata: Metadata = { title: 'Privacy Policy — PaisaJaag' }

export default function PrivacyPage() {
  return (
    <PublicPageShell title="Privacy Policy">
      <p className="text-xs text-gray-400">Version {LEGAL_DOCUMENT_VERSION}</p>

      <h2 className="text-lg font-medium text-gray-900">What we collect</h2>
      <p>
        Your name, phone number, the financial profile you share during
        onboarding (age, income range, life stage, risk temperament), and the
        investments, liabilities and goals you enter. We collect nothing from
        your bank, broker or AMC — everything in PaisaJaag is what you chose to
        tell us.
      </p>

      <h2 className="text-lg font-medium text-gray-900">How it is protected</h2>
      <p>
        Every record is protected by row level security: you can only ever see
        your own data. Family aggregate visibility requires your explicit
        permission, can be revoked any time, and every access is logged. The
        platform administrator cannot see your individual financial data —
        only anonymous platform health metrics.
      </p>

      <h2 className="text-lg font-medium text-gray-900">How it is used</h2>
      <p>
        Your data is used for exactly one purpose: generating your personal
        briefs, alerts, chat responses and simulations. We do not sell data,
        share it with third parties for marketing, or use it for advertising.
        Ever.
      </p>

      <h2 className="text-lg font-medium text-gray-900">
        AI processing
      </h2>
      <p>
        To generate your briefs and chat responses, relevant portions of your
        financial profile are sent to our AI providers (Anthropic Claude) under
        contracts that prohibit training on your data.
      </p>

      <h2 className="text-lg font-medium text-gray-900">
        Your rights — DPDP Act 2023
      </h2>
      <p>
        You may access, correct, or permanently delete all of your data at any
        time. Deletion can be requested from Settings → Delete Account or the{' '}
        <a href="/data-deletion" className="text-amber-800 underline">
          data deletion page
        </a>
        . All data is wiped within 30 days, with WhatsApp confirmation when
        complete.
      </p>

      <p className="text-sm text-gray-400">
        This document is pending final review by our chartered accountant and
        legal counsel.
      </p>
    </PublicPageShell>
  )
}
