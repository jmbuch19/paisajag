import type { FundHealth } from '@/lib/mock-data'

const HEALTH_LABEL: Record<FundHealth, { cls: string; label: string }> = {
  healthy: { cls: 'tag-healthy', label: 'Healthy' },
  // "Review" not "Needs Attention" — non-alarming (DESIGN.md)
  watch: { cls: 'tag-watch', label: 'Review' },
  concern: { cls: 'tag-concern', label: 'Worth a look' },
}

export function HealthTag({ health }: { health: FundHealth }) {
  const { cls, label } = HEALTH_LABEL[health]
  return <span className={`tag ${cls}`}>{label}</span>
}

export function Tag({
  variant,
  children,
}: {
  variant: 'healthy' | 'watch' | 'concern' | 'info' | 'neutral'
  children: React.ReactNode
}) {
  return <span className={`tag tag-${variant}`}>{children}</span>
}
