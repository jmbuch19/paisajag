// Layer 3 output lint — GUARDRAILS.md. Scans every generated response for
// directive language before it reaches the member. A hit triggers one
// corrective regeneration; a second hit replaces the response entirely.

const DIRECTIVE_PATTERNS: RegExp[] = [
  // "you should sell", "you must switch", "you need to exit", …
  /\byou (?:should|must|need to|have to|ought to) (?:sell|buy|switch|exit|invest|redeem|stop|start|move|withdraw)\b/i,
  // "I recommend selling", "I suggest you switch", "I advise exiting", …
  /\bi (?:recommend|suggest|advise) (?:you |that you )?(?:sell|buy|switch|exit|invest|redeem|stop|start|move|withdraw)/i,
  // "my recommendation is to sell", "my advice: switch"
  /\bmy (?:recommendation|advice) (?:is|would be|:)/i,
  // bare imperatives aimed at the member's holdings:
  // "sell this fund", "exit your SIP", "switch to direct now"
  /(?:^|[.!?]\s+)(?:sell|buy|exit|redeem|switch) (?:it|this|that|your|the)\b/im,
  // "the best fund for you is X" — fund recommendation framing
  /\bthe best (?:fund|scheme|option) for you\b/i,
]

export function lintDirectives(text: string): string | null {
  for (const pattern of DIRECTIVE_PATTERNS) {
    const match = pattern.exec(text)
    if (match) return match[0]
  }
  return null
}

export const REGENERATE_INSTRUCTION =
  'Your previous draft crossed from information into a directive, which this ' +
  'platform must never do. Rephrase the same substance as pure information: ' +
  'show the numbers, the trade-offs and the context, and leave the decision ' +
  'explicitly with the member.'

export const SAFE_FALLBACK =
  'I can show you the information around this, but the decision is yours ' +
  'alone to make. Let me lay out what the numbers say — ask me about any ' +
  'specific fund, comparison or scenario and I will walk you through the ' +
  'facts, the costs and the trade-offs. What would you like to look at?'

export const RATE_LIMIT_MESSAGE =
  'We have covered a lot today. Let it settle — good money decisions are ' +
  'rarely made in a hurry. We will pick this up tomorrow, right where we ' +
  'left off.'
