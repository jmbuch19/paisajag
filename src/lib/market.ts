// Alpha Vantage helper — global indices + INR/USD (SPEC.md "Market Data
// Sources", free tier). This is ENRICHMENT for the cached context: structured
// numbers that complement the Perplexity narrative. Every call is best-effort —
// the free tier is rate-limited (5/min, 25/day) and flaky, so a failure here
// must never block the morning brief. Missing values simply drop out.
//
// TODO(backend): Jaydeep picks the final symbol set and may upgrade the tier.

export function alphaVantageConfigured(): boolean {
  return Boolean(process.env.ALPHA_VANTAGE_KEY)
}

export interface IndexQuote {
  label: string
  price: number
  changePercent: number | null
}

export interface MarketSnapshot {
  usdInr: number | null
  indices: IndexQuote[]
}

// US-listed proxies for global benchmarks — GLOBAL_QUOTE works for these on the
// free tier (raw indices do not). Kept short to stay inside the 5/min limit.
const INDEX_PROXIES: { symbol: string; label: string }[] = [
  { symbol: 'QQQ', label: 'Nasdaq 100 (QQQ)' },
  { symbol: 'SPY', label: 'S&P 500 (SPY)' },
]

async function avFetch(params: Record<string, string>): Promise<unknown | null> {
  const key = process.env.ALPHA_VANTAGE_KEY
  if (!key) return null
  const qs = new URLSearchParams({ ...params, apikey: key }).toString()
  try {
    const res = await fetch(`https://www.alphavantage.co/query?${qs}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchUsdInr(): Promise<number | null> {
  const data = (await avFetch({
    function: 'CURRENCY_EXCHANGE_RATE',
    from_currency: 'USD',
    to_currency: 'INR',
  })) as Record<string, Record<string, string>> | null
  const rate = Number(
    data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate'],
  )
  return rate && !Number.isNaN(rate) ? rate : null
}

async function fetchIndexQuote(
  symbol: string,
  label: string,
): Promise<IndexQuote | null> {
  const data = (await avFetch({ function: 'GLOBAL_QUOTE', symbol })) as Record<
    string,
    Record<string, string>
  > | null
  const quote = data?.['Global Quote']
  const price = Number(quote?.['05. price'])
  if (!price || Number.isNaN(price)) return null
  const changeRaw = quote?.['10. change percent'] // e.g. "1.23%"
  const changePercent = changeRaw ? Number(changeRaw.replace('%', '')) : null
  return {
    label,
    price,
    changePercent: changePercent !== null && !Number.isNaN(changePercent) ? changePercent : null,
  }
}

// Best-effort structured snapshot. Returns whatever resolved; never throws.
export async function fetchGlobalSnapshot(): Promise<MarketSnapshot> {
  if (!alphaVantageConfigured()) return { usdInr: null, indices: [] }

  const [usdInr, ...indexResults] = await Promise.all([
    fetchUsdInr(),
    ...INDEX_PROXIES.map((p) => fetchIndexQuote(p.symbol, p.label)),
  ])

  return {
    usdInr,
    indices: indexResults.filter((q): q is IndexQuote => q !== null),
  }
}
