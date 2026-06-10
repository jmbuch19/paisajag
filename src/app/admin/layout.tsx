import Link from 'next/link'
import { PLATFORM_NAME } from '@/lib/constants'

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/costs', label: 'Costs' },
  { href: '/admin/nudges', label: 'Nudges' },
  { href: '/admin/deletions', label: 'Deletions' },
  { href: '/admin/legal', label: 'Legal Log' },
]

// Admin sees platform health only — never individual member
// financial data (MEMORY.md privacy architecture).
// TODO(backend): gate behind owner auth + service role data.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b-[0.5px] border-gray-200 bg-white px-6 py-4">
        <p className="text-lg font-medium text-amber-600">
          {PLATFORM_NAME}{' '}
          <span className="text-sm font-normal text-gray-400">admin</span>
        </p>
        <nav aria-label="Admin" className="mt-3 flex flex-wrap gap-4">
          {ADMIN_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-600 hover:text-amber-800"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-6">{children}</main>
    </div>
  )
}
