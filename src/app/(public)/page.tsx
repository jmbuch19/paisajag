import Link from 'next/link'
import { KabirQuote } from '@/components/KabirQuote'
import { SiteFooter } from '@/components/SiteFooter'
import { PLATFORM_NAME, TAGLINE, SHORT_DISCLAIMER } from '@/lib/constants'

const PERSONAS = [
  {
    title: 'Families',
    text: 'One place where the whole family can finally see what the money is doing — without anyone peeking into anyone else’s accounts.',
  },
  {
    title: 'Parents',
    text: 'You built the savings. PaisaJag helps you see them clearly — in plain language, at your pace, with no one rushing you.',
  },
  {
    title: 'Retirees',
    text: 'Your capital has worked hard for decades. Now you deserve to know, every morning, that it is resting safely — or when it isn’t.',
  },
  {
    title: 'Young professionals',
    text: 'SIPs started, apps installed, and still no idea what it all adds up to. One calm morning message instead of seven noisy dashboards.',
  },
]

const EVENING_TIMELINE = [
  { time: '6:00pm', event: 'A company in your fund announces results.' },
  { time: '8:00pm', event: 'Business channels debate it loudly.' },
  {
    time: '8:15pm',
    event: 'PaisaJag sends you a calm note: what happened, your exposure, no panic.',
  },
  {
    time: '9:15am',
    event: 'Everyone else finds out when the market opens.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-amber-50">
      {/* Section 1 — Hero */}
      <section className="px-6 pb-12 pt-16 text-center">
        <div className="mx-auto max-w-lg space-y-5">
          <span className="text-5xl" role="img" aria-label="Sunrise">
            🌅
          </span>
          <h1 className="text-3xl font-medium text-amber-600">
            {PLATFORM_NAME}
          </h1>
          <p className="text-lg text-amber-800">{TAGLINE}</p>
          <KabirQuote />
          <p className="text-lg text-gray-900">Your money is awake. Are you?</p>
          <p className="text-gray-600">
            PaisaJag watches over your family’s investments and tells you, in
            plain language, what is happening and what it means for you. We
            show you the picture — the decisions are always yours.
          </p>
          <Link href="/login" className="btn-primary">
            Start your journey
          </Link>
          <p className="text-xs text-gray-400">{SHORT_DISCLAIMER}</p>
        </div>
      </section>

      {/* Section 2 — The Promise */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-lg space-y-4 text-center">
          <h2 className="text-xl font-medium text-gray-900">
            We will never tell you what to do.
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>We will show you what you own — all of it, in one place.</li>
            <li>We will explain what last night’s news means for you.</li>
            <li>We will let you simulate any decision before you make it.</li>
            <li>We will stay silent when there is nothing worth saying.</li>
          </ul>
          <p className="font-medium text-amber-800">
            The decision is always yours.
          </p>
        </div>
      </section>

      {/* Section 3 — Who This Is For */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-lg space-y-4">
          <h2 className="text-center text-xl font-medium text-gray-900">
            Who this is for
          </h2>
          <div className="space-y-3">
            {PERSONAS.map(({ title, text }) => (
              <div key={title} className="card">
                <h3 className="font-medium text-amber-800">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Morning Nudge Preview */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-lg space-y-4">
          <h2 className="text-center text-xl font-medium text-gray-900">
            Your morning, every morning
          </h2>
          <div className="rounded-xl bg-gray-100 p-4">
            <div className="rounded-lg bg-white p-4 text-sm leading-relaxed text-gray-900 shadow-sm">
              <p className="font-medium">🌍 Overnight World</p>
              <p className="mt-1 text-gray-600">
                US markets closed slightly higher. Quiet night in Asia. Crude
                eased a little.
              </p>
              <p className="mt-3 font-medium">📊 What This Means For You</p>
              <p className="mt-1 text-gray-600">
                Your funds are largely domestic — limited direct effect today.
                Your SIPs continue quietly in the background.
              </p>
              <p className="mt-3 font-medium">💡 For Your Awareness</p>
              <p className="mt-1 text-gray-600">
                Markets were a little rough last week. Your portfolio is
                designed for this.
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
            Delivered to your WhatsApp every morning at 6:30am.
          </p>
        </div>
      </section>

      {/* Section 5 — The Evening Hand */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-lg space-y-5">
          <h2 className="text-center text-xl font-medium text-gray-900">
            When something happens, you hear it first
          </h2>
          <ol className="space-y-3">
            {EVENING_TIMELINE.map(({ time, event }) => (
              <li key={time} className="flex gap-4">
                <span className="w-16 shrink-0 text-right text-sm font-medium text-amber-800 tabular-nums">
                  {time}
                </span>
                <span className="text-sm text-gray-600">{event}</span>
              </li>
            ))}
          </ol>
          <p className="text-center font-medium text-amber-800">
            The difference is who tells you first.
          </p>
        </div>
      </section>

      {/* Section 6 — Footer */}
      <SiteFooter />
    </main>
  )
}
