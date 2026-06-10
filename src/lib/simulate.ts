// Simulation calculations — SPEC.md. Standard financial mathematics.
// Always display the assumption; never false precision.

/** Future value of a monthly SIP at an assumed annual rate. */
export function sipCorpus(
  monthlyAmount: number,
  years: number,
  annualRate: number
): number {
  const r = annualRate / 12 / 100
  const n = years * 12
  if (r === 0) return monthlyAmount * n
  return monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
}

/** Future value of a lumpsum at an assumed annual rate. */
export function lumpsumCorpus(
  amount: number,
  years: number,
  annualRate: number
): number {
  return amount * Math.pow(1 + annualRate / 100, years)
}
