import Link from 'next/link'
import { KabirQuote } from './KabirQuote'
import { CONTACT_EMAIL, SHORT_DISCLAIMER } from '@/lib/constants'

const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/data-deletion', label: 'Data Deletion' },
  { href: `mailto:${CONTACT_EMAIL}`, label: 'Contact' },
]

export function SiteFooter() {
  return (
    <footer className="border-t-[0.5px] border-gray-200 bg-amber-50 px-6 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <KabirQuote quiet />
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-5 gap-y-2"
        >
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-amber-800 hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-gray-400">{SHORT_DISCLAIMER}</p>
      </div>
    </footer>
  )
}
