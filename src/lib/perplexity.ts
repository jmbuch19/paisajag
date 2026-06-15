// Perplexity helper — live overnight market context (SPEC.md "Market Data
// Sources": overnight market news, once at ~6:00am IST). Called ONCE per day by
// the market-fetch cron; the result is cached and shared across every member's
// morning brief, so this is the single most cost-sensitive external call.
//
// TODO(backend): Jaydeep confirms the model id and the exact prompt at go-live.

// Perplexity online model. 'sonar' is the cheap web-grounded tier; 'sonar-pro'
// for richer synthesis. One call/day, so cost is negligible either way.
export const PERPLEXITY_MODEL = 'sonar'

// Rough cost for api_usage logging. Perplexity bills per token plus a small
// per-request search fee; this approximates the all-in cost of one daily call.
const PRICE_INPUT_PER_MTOK = 1.0
const PRICE_OUTPUT_PER_MTOK = 1.0
const PER_REQUEST_USD = 0.005

export function perplexityConfigured(): boolean {
  return Boolean(process.env.PERPLEXITY_API_KEY)
}

export interface MarketNarrative {
  text: string
  inputTokens: number
  outputTokens: number
  costUsd: number
}

const SYSTEM_PROMPT =
  'You are a factual market data summariser for an Indian retail-investor ' +
  'platform. Report only what happened — no predictions, no advice, no ' +
  'buy/sell language. Indian English, plain prose, no markdown.'

const USER_PROMPT =
  'Summarise overnight and pre-open market context for an Indian investor ' +
  'this morning, in about 180 words. Cover, where notable: US markets ' +
  '(Nasdaq, S&P 500) overnight close, major Asian markets this morning, ' +
  'crude oil and gold, the USD/INR rate, and any single global event likely ' +
  'to set the tone for Indian markets today (Nifty/Sensex). State facts and ' +
  'figures only. Do not predict direction and do not give any advice.'

// Fetch today's overnight market narrative. Returns null when the key is not
// configured (preview/staging) — the caller decides how to handle that.
export async function fetchOvernightMarketContext(): Promise<MarketNarrative | null> {
  const key = process.env.PERPLEXITY_API_KEY
  if (!key) return null

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: PERPLEXITY_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`perplexity_http_${res.status}: ${detail.slice(0, 200)}`)
  }

  const data = await res.json()
  const text: string = data?.choices?.[0]?.message?.content?.trim() ?? ''
  if (!text) throw new Error('perplexity_empty_response')

  const inputTokens = Number(data?.usage?.prompt_tokens ?? 0)
  const outputTokens = Number(data?.usage?.completion_tokens ?? 0)
  const costUsd =
    (inputTokens * PRICE_INPUT_PER_MTOK + outputTokens * PRICE_OUTPUT_PER_MTOK) /
      1_000_000 +
    PER_REQUEST_USD

  return { text, inputTokens, outputTokens, costUsd }
}
