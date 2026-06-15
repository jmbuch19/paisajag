// Morning brief — user-turn prompt (SPEC.md "Morning Brief Prompt").
//
// The brief reuses the EXACT chat system prompt (buildSystemPrompt): same
// Option A boundary, same Financial DNA grounding, same equity-analysis lens
// gate (GUARDRAILS Layer 1). Only the task differs, and a task belongs in the
// user turn — so this file just assembles that turn. The shared market context
// is wrapped as data, never as instructions (GUARDRAILS Layer 2).

// Collapse the cached market context into a compact, bounded string.
// Prefers the structured parse; falls back to the raw Perplexity text.
export function formatMarketContext(
  parsed: unknown,
  raw: string | null,
): string {
  let text: string
  if (parsed && typeof parsed === 'object') {
    text = JSON.stringify(parsed, null, 0)
  } else if (typeof parsed === 'string' && parsed.trim()) {
    text = parsed
  } else {
    text = raw ?? ''
  }
  return text.slice(0, 4000)
}

export function buildBriefUserPrompt(marketContext: string): string {
  return `Today's market context — factual, the same for every member:
<market_context>
${marketContext}
</market_context>

Write this member's personalised morning brief, to be delivered on WhatsApp.

Format (hard rules):
- Plain text only. This is a WhatsApp message — no markdown, no tables, no bullet symbols, no bold.
- Maximum 250 words.
- Greet the member by their first name once, warmly, in their life-stage tone.
- Exactly three sections, each led by its emoji heading on its own line:
  🌍 Overnight World — a calm, factual summary of what moved overnight. The general market only, not their portfolio.
  📊 What This Means For You — connect the above ONLY to funds and holdings this member actually owns (see their context). If nothing they hold is meaningfully affected, say so plainly and reassuringly. Never invent exposure they do not have.
  💡 For Your Awareness — one calm, informational observation. Never a directive, never a nudge to act, never timing.
- Do NOT add any disclaimer or sign-off — the platform appends the standard disclaimer itself.

Information only. Nothing in this brief may read as buy / sell / switch / exit / hold / "consider" guidance. The decision is always the member's.`
}
