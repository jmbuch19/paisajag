import Link from 'next/link'
import { SiteFooter } from './SiteFooter'
import { PLATFORM_NAME } from '@/lib/constants'

export function PublicPageShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col bg-amber-50">
      <header className="border-b-[0.5px] border-gray-200 bg-amber-50">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <Link href="/" className="text-lg font-medium text-amber-600">
            {PLATFORM_NAME}
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <h1 className="text-xl font-medium text-gray-900">{title}</h1>
        <div className="mt-6 space-y-4 text-gray-600">{children}</div>
      </div>
      <SiteFooter />
    </main>
  )
}
