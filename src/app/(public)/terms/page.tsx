import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/PublicPageShell'
import { LEGAL_DOCUMENT_VERSION } from '@/lib/constants'

export const metadata: Metadata = { title: 'Terms of Service — PaisaJag' }

export default function TermsPage() {
  return (
    <PublicPageShell title="Terms of Service">
      <p className="text-xs text-gray-400">Version {LEGAL_DOCUMENT_VERSION}</p>

      <h2 className="text-lg font-medium text-gray-900">The service</h2>
      <p>
        PaisaJag provides financial information, awareness briefs and
        simulation tools. It does not provide investment advice, portfolio
        management or execution services. Use of the platform requires
        acknowledging the disclaimer during onboarding.
      </p>

      <h2 className="text-lg font-medium text-gray-900">Your account</h2>
      <p>
        Accounts are personal and tied to your phone number. You are
        responsible for the accuracy of the financial information you enter —
        briefs and simulations are only as accurate as the data you provide.
      </p>

      <h2 className="text-lg font-medium text-gray-900">Pricing</h2>
      <p>
        The platform is complimentary for the first six months. Paid plans
        (Founding ₹99/month, Individual ₹199/month, Family ₹499/month) activate
        afterwards with advance notice. If a subscription lapses, your
        portfolio remains visible read-only; nothing is deleted.
      </p>

      <h2 className="text-lg font-medium text-gray-900">Limitations</h2>
      <p>
        Market data, NAVs and news summaries come from third-party sources and
        may be delayed or contain errors. PaisaJag is not liable for losses
        arising from decisions made using information on the platform.
      </p>

      <h2 className="text-lg font-medium text-gray-900">Termination</h2>
      <p>
        You may delete your account at any time; all data is wiped within 30
        days. We may suspend accounts that abuse the platform, with notice.
      </p>

      <p className="text-sm text-gray-400">
        This document is pending final review by our chartered accountant and
        legal counsel.
      </p>
    </PublicPageShell>
  )
}
