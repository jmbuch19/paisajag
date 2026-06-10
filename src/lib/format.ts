// Financial number display rules — DESIGN.md
// 1. Indian numbering: ₹1,25,000 not ₹125,000
// 2. Lakhs above ₹1,00,000 → ₹12.5L
// 3. Crores above ₹1,00,00,000 → ₹1.2Cr
// 4. Negative values use parentheses: (₹6.5L)
// 5. Percentages: always 1 decimal place

const LAKH = 100_000
const CRORE = 10_000_000

/** Indian-grouped number: 125000 → "1,25,000" */
export function indianGroup(n: number): string {
  return Math.round(Math.abs(n)).toLocaleString('en-IN')
}

/** Full rupee amount with Indian grouping: ₹1,25,000 / (₹6,500) */
export function rupees(n: number): string {
  const formatted = `₹${indianGroup(n)}`
  return n < 0 ? `(${formatted})` : formatted
}

/** Abbreviated amount: ₹12.5L above 1 lakh, ₹1.2Cr above 1 crore */
export function rupeesShort(n: number): string {
  const abs = Math.abs(n)
  let formatted: string
  if (abs >= CRORE) {
    formatted = `₹${(abs / CRORE).toFixed(1)}Cr`
  } else if (abs >= LAKH) {
    formatted = `₹${(abs / LAKH).toFixed(1)}L`
  } else {
    formatted = `₹${indianGroup(abs)}`
  }
  return n < 0 ? `(${formatted})` : formatted
}

/** Simulation rounding — SPEC.md: nearest ₹1,000 above ₹10,000 */
export function roundForDisplay(n: number): number {
  if (Math.abs(n) > 10_000) return Math.round(n / 1000) * 1000
  return Math.round(n)
}

/** Percentage with exactly 1 decimal place: 12.4% */
export function percent(n: number): string {
  return `${n.toFixed(1)}%`
}

/** Warm date: "Tuesday, 9 June 2026" */
export function warmDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Time-aware greeting */
export function greeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
