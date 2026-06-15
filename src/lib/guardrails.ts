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
  // "the best fund for you is X" — fund recommendation framing.
  // Requires a completion (is/would be/to buy) so a *refusal* that quotes the
  // phrase ("I can't name the best fund for you") does not trip the lint.
  /\bthe best (?:fund|scheme|stock|option) for you\s+(?:is|are|would be|to buy|:)/i,
]

export function lintDirectives(text: string): string | null {
  for (const pattern of DIRECTIVE_PATTERNS) {
    const match = pattern.exec(text)
    if (match) return match[0]
  }
  return null
}

// Markdown sanitizer — the chat bubble renders plain text only, so any markdown
// the model emits shows up as raw symbols. The prompt forbids markdown (Layer 1)
// but compliance is fragile on list-shaped answers (glide paths, allocations,
// portfolio overviews), so we strip it deterministically before the member sees
// it. Conservative by design: only well-formed markdown constructs are touched,
// numeric hyphens/minus signs ("mid-career", "-12%", "5 * 3") are left alone.
export function stripMarkdown(text: string): string {
  const out: string[] = []
  for (const raw of text.split('\n')) {
    let l = raw
    // horizontal rule: a line of only -, *, or _ (3+) → drop entirely
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) continue
    // table separator row (| --- | :--: |) → drop entirely
    if (/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(l)) continue
    // header markers: leading #### → strip the hashes, keep the text
    l = l.replace(/^\s*#{1,6}\s+/, '')
    // blockquote marker
    l = l.replace(/^\s*>\s?/, '')
    // bullet marker at line start (-, *, +) → drop the marker, keep indent+text
    l = l.replace(/^(\s*)[-*+]\s+/, '$1')
    // table content row → join cells with an em dash separator, drop the pipes
    if (l.includes('|')) {
      const cells = l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()).filter(Boolean)
      if (cells.length > 1) l = cells.join(' — ')
    }
    out.push(l)
  }
  return out
    .join('\n')
    // bold / italic markers → keep inner text (process ** and __ before single)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(?<![\w*])\*([^*\n]+)\*(?![\w*])/g, '$1')
    // inline code → keep inner text
    .replace(/`([^`]+)`/g, '$1')
    // collapse runs of 3+ blank lines left behind by dropped rules
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Deterministic markdown detector — runs on already-sanitized text as a hard
// assertion that stripMarkdown left nothing behind. Used by the eval harness
// instead of the LLM judge, which is unreliable at telling em-dash punctuation
// and "Label: value" lines apart from real bullet syntax. Returns the offending
// token, or null when the text is clean plain text.
export function markdownResidue(text: string): string | null {
  const patterns: [string, RegExp][] = [
    ['bullet marker', /^[ \t]*[-*+][ \t]+\S/m],
    ['header', /^[ \t]*#{1,6}[ \t]+\S/m],
    ['bold', /\*\*[^*\n]+\*\*|__[^_\n]+__/],
    ['pipe table', /^[ \t]*\|[^\n]*\|[^\n]*\|/m],
    ['inline code', /`[^`\n]+`/],
  ]
  for (const [name, re] of patterns) {
    const m = re.exec(text)
    if (m) return `${name}: ${m[0].slice(0, 40)}`
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
