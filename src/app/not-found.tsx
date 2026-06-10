import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-6 text-center">
      <span className="text-4xl" role="img" aria-label="Sunrise">
        🌅
      </span>
      <h1 className="mt-4 text-xl font-medium text-gray-900">
        This page seems to have wandered off
      </h1>
      <p className="mt-2 max-w-sm text-gray-600">
        Nothing to worry about — your data is safe. Let’s head back somewhere
        familiar.
      </p>
      <Link href="/" className="btn-primary mt-8 max-w-xs">
        Back to home
      </Link>
    </main>
  )
}
