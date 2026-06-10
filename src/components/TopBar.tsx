'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PLATFORM_NAME } from '@/lib/constants'

// Platform name centred in amber-600 (decorative use — allowed).
// Back arrow on inner screens. No hamburger menus.
export function TopBar({
  title,
  showBack = false,
}: {
  title?: string
  showBack?: boolean
}) {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-20 bg-amber-50/95 backdrop-blur border-b-[0.5px] border-gray-200">
      <div className="relative mx-auto flex h-14 max-w-lg items-center justify-center px-4">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full text-gray-600 hover:bg-amber-100"
          >
            <ArrowLeft size={20} aria-hidden />
          </button>
        )}
        {title ? (
          <h1 className="text-lg font-medium text-gray-900">{title}</h1>
        ) : (
          <Link href="/dashboard" className="text-lg font-medium text-amber-600">
            {PLATFORM_NAME}
          </Link>
        )}
      </div>
    </header>
  )
}
