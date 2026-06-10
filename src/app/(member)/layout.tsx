import { BottomNav } from '@/components/BottomNav'

// Authenticated member shell — bottom tab bar everywhere,
// page content padded clear of it.
// TODO(backend): wrap with session check once Supabase auth lands.
export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
