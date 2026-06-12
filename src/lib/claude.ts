import Anthropic from '@anthropic-ai/sdk'

// Model id centralised here per MEMORY.md AI-stack decision —
// reconfirm at go-live, change in exactly one place.
export const CLAUDE_MODEL = 'claude-sonnet-4-6'

// Pricing for cost logging (api_usage). USD per million tokens.
export const PRICE_INPUT_PER_MTOK = 3.0
export const PRICE_OUTPUT_PER_MTOK = 15.0
export const USD_TO_INR = 84

export function costUsd(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens * PRICE_INPUT_PER_MTOK + outputTokens * PRICE_OUTPUT_PER_MTOK) /
    1_000_000
  )
}

let client: Anthropic | null = null

export function getClaude(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!client) client = new Anthropic()
  return client
}
