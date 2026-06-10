'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  PieChart,
  MessageCircle,
  TrendingUp,
  User,
} from 'lucide-react'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/portfolio', label: 'Portfolio', icon: PieChart },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/simulate', label: 'Simulate', icon: TrendingUp },
  { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-20 border-t-[0.5px] border-gray-200 bg-white"
    >
      <div className="mx-auto flex max-w-lg">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium ${
                active ? 'text-amber-600' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.5} aria-hidden />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
