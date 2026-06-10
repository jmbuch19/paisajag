import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/PublicPageShell'

export const metadata: Metadata = { title: 'About — PaisaJaag' }

export default function AboutPage() {
  return (
    <PublicPageShell title="What PaisaJaag is — and is not">
      <h2 className="text-lg font-medium text-gray-900">What we are</h2>
      <p>
        PaisaJaag is a personal finance awareness platform for Indian families.
        We bring your mutual funds, deposits and loans into one calm picture,
        explain overnight market news in plain language, and let you simulate
        any financial decision before you make it.
      </p>
      <p>
        Every morning at 6:30am, a short brief arrives on your WhatsApp — what
        happened in the world overnight, and what it means for your portfolio
        specifically. When something material happens in the evening, you hear
        about it from us first, calmly. When nothing happens, we stay quiet.
        Silence is a feature.
      </p>

      <h2 className="text-lg font-medium text-gray-900">What we are not</h2>
      <p>
        We are not a SEBI registered investment advisor, and we never give
        advice. We will never tell you to buy, sell or switch anything. We show
        you information, context and simulations — the decision is always
        yours.
      </p>
      <p>
        We are not a trading app. There are no buy buttons here, no urgency, no
        notifications engineered to make you act. PaisaJaag is built to make
        you calmer about money, not busier with it.
      </p>

      <h2 className="text-lg font-medium text-gray-900">Privacy, simply</h2>
      <p>
        Your financial data is yours. Family members each see only their own
        portfolio. A family head can see the family aggregate only with each
        member’s explicit permission — and every access is logged. Even the
        platform owner cannot see your individual numbers.
      </p>
    </PublicPageShell>
  )
}
