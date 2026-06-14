import type { MemberData } from './use-member-data'
import { rupeesShort } from './format'

// Proactive chat opener + suggestion chips — computed in plain code from the
// member's recorded holdings. No Claude call (the opener is free and never
// counts against the daily limit); pure information, Option-A-safe by design.

const isEquity = (t: string) =>
  t.startsWith('equity') || ['stocks', 'index', 'international'].includes(t)

export function chatOpener(d: MemberData): string {
  const name = d.member.fullName.split(' ')[0]
  const hi = name ? `Hello, ${name}` : 'Hello'

  const assets = d.investments.reduce((s, i) => s + i.currentValue, 0)
  const debt = d.liabilities.reduce((s, l) => s + l.outstandingAmount, 0)

  // Nothing recorded yet — invite the first entry.
  if (d.investments.length === 0 && d.liabilities.length === 0) {
    return `${hi}. Your portfolio is empty for now — add an investment or a loan and I can talk you through what it means for you. What's on your mind?`
  }

  // Loans currently outweigh investments — gentle, honest opener.
  if (debt > assets && debt > 0) {
    return `${hi}. Looking at your full picture, your loans currently outweigh your investments — nothing to panic about, but worth understanding together. Shall we walk through it?`
  }

  // Heavy concentration in a single holding.
  if (assets > 0) {
    const top = [...d.investments].sort((a, b) => b.currentValue - a.currentValue)[0]
    const share = top.currentValue / assets
    if (share >= 0.6) {
      return `${hi}. One thing worth seeing: about ${Math.round(share * 100)}% of your investments sit in ${top.fundName}. Want to look at what that concentration means for you?`
    }
  }

  // A holding notably below cost (lifetime).
  const losers = d.investments
    .filter((i) => i.investedAmount > 0)
    .map((i) => ({ i, ret: (i.currentValue - i.investedAmount) / i.investedAmount }))
    .filter((x) => x.ret <= -0.1)
    .sort((a, b) => a.ret - b.ret)
  if (losers.length > 0) {
    const w = losers[0]
    return `${hi}. ${w.i.fundName} is down about ${Math.round(Math.abs(w.ret) * 100)}% from what you put in — want to understand what's behind it? No rush to do anything about it.`
  }

  // Goal progress.
  if (d.goals.length > 0) {
    const g = d.goals[0]
    const pct = g.targetAmount > 0 ? Math.round(Math.min(g.currentSavings / g.targetAmount, 1) * 100) : 0
    return `${hi}. You're about ${pct}% of the way to ${g.goalName}. Want to see how it's tracking?`
  }

  // Default — net position.
  return `${hi}. Your investments are worth about ${rupeesShort(assets)} right now. Anything you'd like to look at together?`
}

export function chatChips(d: MemberData): string[] {
  const chips: string[] = []
  if (d.investments.some((i) => isEquity(i.fundType))) {
    chips.push('How concentrated is my equity?')
  }
  if (d.goals.length > 0) {
    chips.push(`Am I on track for ${d.goals[0].goalName}?`)
  }
  if (d.liabilities.length > 0) {
    chips.push('How do my loans affect my net worth?')
  }
  if (d.investments.some((i) => i.planType === 'regular')) {
    chips.push('Why does a regular vs direct plan matter for me?')
  }
  chips.push('Give me an overview of my whole portfolio')
  return chips.slice(0, 3)
}
