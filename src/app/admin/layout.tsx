import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PLATFORM_NAME } from '@/lib/constants'
import { getSupabaseServer } from '@/lib/supabase/server'

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
// Gate: session email must be in ADMIN_EMAILS. Preview mode (no envs)
// stays open so the design is browsable without a backend.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = getSupabaseServer()
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const admins = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
    if (!user || !user.email || !admins.includes(user.email.toLowerCase())) {
      redirect('/dashboard')
    }
  }
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
