import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/PublicPageShell'
import { LEGAL_DOCUMENT_VERSION } from '@/lib/constants'

export const metadata: Metadata = { title: 'Disclaimer — PaisaJag' }

export default function DisclaimerPage() {
  return (
    <PublicPageShell title="Disclaimer">
      <p className="text-xs text-gray-400">Version {LEGAL_DOCUMENT_VERSION}</p>
      <p>
        PaisaJag is an information and awareness platform. PaisaJag is{' '}
        <strong className="font-medium text-gray-900">
          not a SEBI registered investment advisor
        </strong>{' '}
        and does not provide investment advice of any kind.
      </p>
      <p>
        Nothing on this platform — including morning briefs, evening alerts,
        chat responses, fund health indicators and simulations — constitutes a
        recommendation to buy, sell, hold or switch any financial product.
        All content is information only.
      </p>
      <p>
        Mutual fund investments are subject to market risks. Read all scheme
        related documents carefully. Past performance is not indicative of
        future returns.
      </p>
      <p>
        Simulations use stated assumptions (default 12% CAGR) that are not
        guaranteed. Actual returns will differ. Projections are illustrations,
        not promises.
      </p>
      <p>
        Before making any investment decision, consider consulting a SEBI
        registered investment advisor. Every decision you make is yours alone,
        and PaisaJag accepts no liability for decisions made on the basis of
        information shown on this platform.
      </p>
      <p className="text-sm text-gray-400">
        This document is pending final review by our chartered accountant and
        legal counsel.
      </p>
    </PublicPageShell>
  )
}
