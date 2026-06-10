import { rupeesShort } from '@/lib/format'

// Financial numbers never rely on colour alone — callers pair this
// with a text label (DESIGN.md accessibility rules).
export function Amount({
  value,
  signed = false,
  className = '',
}: {
  value: number
  signed?: boolean
  className?: string
}) {
  const colour = !signed
    ? 'text-gray-900'
    : value < 0
      ? 'text-red-600'
      : 'text-teal-600'
  return (
    <span className={`font-medium tabular-nums ${colour} ${className}`}>
      {rupeesShort(value)}
    </span>
  )
}
