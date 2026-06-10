import type { LucideIcon } from 'lucide-react'

// Never a blank screen: warm icon + human explanation + clear next action.
export function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: LucideIcon
  message: string
  action?: React.ReactNode
}) {
  return (
    <div className="card flex flex-col items-center gap-4 py-10 text-center">
      <Icon size={36} strokeWidth={1.25} className="text-amber-600" aria-hidden />
      <p className="max-w-xs text-gray-600">{message}</p>
      {action}
    </div>
  )
}
