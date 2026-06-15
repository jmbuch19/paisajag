import { NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { CLAUDE_MODEL, getClaude, costUsd, USD_TO_INR } from '@/lib/claude'
import { buildSystemPrompt, type MemberContext } from '@/lib/chat-prompt'
import { buildBriefUserPrompt, formatMarketContext } from '@/lib/brief-prompt'
import {
  lintDirectives,
  REGENERATE_INSTRUCTION,
  SAFE_FALLBACK,
} from '@/lib/guardrails'
import { STANDARD_DISCLAIMER } from '@/lib/constants'
import {
  sendWhatsAppTemplate,
  whatsappConfigured,
  MORNING_BRIEF_TEMPLATE,
} from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
// One Claude call per member, sent in a small concurrency pool. Founding-member
// scale (< a few hundred) fits comfortably; revisit batching past that.
export const maxDuration = 300

// ── IST day helpers ─────────────────────────────────────────────────────────
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function istParts() {
  const nowIst = new Date(Date.now() + IST_OFFSET_MS)
  return {
    y: nowIst.getUTCFullYear(),
    m: nowIst.getUTCMonth(),
    d: nowIst.getUTCDate(),
  }
}

// Today's IST calendar date as 'YYYY-MM-DD' (the market_context_cache key).
function istDateString(): string {
  const { y, m, d } = istParts()
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// Start of the current IST day as a UTC instant — used to dedupe today's sends.
function istDayStartUtc(): string {
  const { y, m, d } = istParts()
  return new Date(Date.UTC(y, m, d) - IST_OFFSET_MS).toISOString()
}

// ── small fixed-concurrency pool ────────────────────────────────────────────
async function pool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const idx = cursor++
        results[idx] = await fn(items[idx])
      }
    },
  )
  await Promise.all(workers)
  return results
}

function textOf(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
}

type MemberRow = {
  user_id: string
  phone: string | null
  full_name: string | null
  age: number | null
  life_stage: string | null
  risk_profile: string | null
  employment_type: string | null
  income_range: string | null
  marital_status: string | null
  dependents_count: number | null
  tax_slab: string | null
}

type Admin = NonNullable<ReturnType<typeof getSupabaseAdmin>>

// Load one member's portfolio context via the service-role client. RLS is
// bypassed here, so EVERY query is explicitly scoped to this user_id — the
// brief must contain exactly one member's data (GUARDRAILS privacy rule).
async function loadMemberContext(
  admin: Admin,
  member: MemberRow,
): Promise<MemberContext> {
  const uid = member.user_id
  const [invRes, liaRes, goalRes] = await Promise.all([
    admin
      .from('investments')
      .select(
        'fund_name, fund_type, invested_amount, current_value, monthly_sip_amount, plan_type',
      )
      .eq('user_id', uid),
    admin
      .from('liabilities')
      .select(
        'liability_type, lender_name, outstanding_amount, emi_amount, interest_rate',
      )
      .eq('user_id', uid),
    admin
      .from('goals')
      .select('goal_name, target_amount, target_date, current_savings')
      .eq('user_id', uid)
      .eq('status', 'active'),
  ])

  return {
    fullName: member.full_name ?? 'Member',
    age: member.age ?? null,
    lifeStage: member.life_stage ?? '',
    riskProfile: member.risk_profile ?? '',
    employmentType: member.employment_type ?? '',
    incomeRange: member.income_range ?? '',
    maritalStatus: member.marital_status ?? '',
    dependentsCount: member.dependents_count ?? 0,
    taxSlab: member.tax_slab ?? '',
    investments: (invRes.data ?? []).map((r) => ({
      fundName: r.fund_name,
      fundType: r.fund_type ?? 'other',
      investedAmount: Number(r.invested_amount ?? 0),
      currentValue: Number(r.current_value ?? 0),
      monthlySip: r.monthly_sip_amount ? Number(r.monthly_sip_amount) : null,
      planType: r.plan_type ?? 'unknown',
    })),
    liabilities: (liaRes.data ?? []).map((r) => ({
      liabilityType: r.liability_type,
      lenderName: r.lender_name ?? '',
      outstandingAmount: Number(r.outstanding_amount ?? 0),
      emiAmount: r.emi_amount ? Number(r.emi_amount) : null,
      interestRate: r.interest_rate ? Number(r.interest_rate) : null,
    })),
    goals: (goalRes.data ?? []).map((r) => ({
      goalName: r.goal_name,
      targetAmount: Number(r.target_amount ?? 0),
      targetDate: r.target_date ?? '',
      currentSavings: Number(r.current_savings ?? 0),
    })),
  }
}

// Daily morning brief (SPEC.md "Morning Brief — delivery 6:30am IST").
// Reads the shared market_context_cache (populated earlier by the market-fetch
// cron), personalises one brief per opted-in member with Claude, runs the
// Layer 3 directive lint, sends via a pre-approved WhatsApp template, and logs
// to nudge_log + api_usage. Idempotent per IST day — a member already briefed
// today is skipped, so a retry never double-sends.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const claude = getClaude()
  if (!admin || !claude) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const cacheDate = istDateString()
  const dayStart = istDayStartUtc()
  const nowIso = new Date().toISOString()

  // 1) Shared market context for today. No cache → the market-fetch cron has not
  //    run; abort rather than send a stale or empty brief.
  const { data: cacheRow } = await admin
    .from('market_context_cache')
    .select('raw_context, parsed_context, expires_at')
    .eq('cache_date', cacheDate)
    .maybeSingle()

  if (!cacheRow) {
    console.error(`[morning-brief] no market_context_cache for ${cacheDate}`)
    return NextResponse.json(
      { ok: false, reason: 'no_market_context', date: cacheDate },
      { status: 200 },
    )
  }
  if (cacheRow.expires_at && cacheRow.expires_at < nowIso) {
    console.error(`[morning-brief] market context expired for ${cacheDate}`)
    return NextResponse.json(
      { ok: false, reason: 'market_context_expired', date: cacheDate },
      { status: 200 },
    )
  }

  const marketContext = formatMarketContext(
    cacheRow.parsed_context,
    cacheRow.raw_context,
  )

  // 2) Opted-in, onboarded members with a phone on file.
  const { data: members, error: membersErr } = await admin
    .from('profiles')
    .select(
      'user_id, phone, full_name, age, life_stage, risk_profile, employment_type, income_range, marital_status, dependents_count, tax_slab',
    )
    .eq('dna_complete', true)
    .eq('whatsapp_nudges_enabled', true)
    .not('phone', 'is', null)

  if (membersErr) {
    return NextResponse.json({ error: membersErr.message }, { status: 500 })
  }
  if (!members || members.length === 0) {
    return NextResponse.json({ ok: true, date: cacheDate, members: 0, sent: 0 })
  }

  // 3) Dedupe — members already briefed today (idempotent retries).
  const { data: sentToday } = await admin
    .from('nudge_log')
    .select('user_id')
    .eq('nudge_type', 'morning_brief')
    .gte('created_at', dayStart)
  const alreadySent = new Set((sentToday ?? []).map((r) => r.user_id))

  const pending = (members as MemberRow[]).filter(
    (m) => !alreadySent.has(m.user_id),
  )

  // 4) Generate → lint → send → log, a few members at a time.
  type Outcome = 'sent' | 'logged_undelivered' | 'failed'
  const outcomes = await pool<MemberRow, Outcome>(pending, 4, async (member) => {
    try {
      const ctx = await loadMemberContext(admin, member)
      const system = buildSystemPrompt(ctx)
      const userPrompt = buildBriefUserPrompt(marketContext)

      let inputTokens = 0
      let outputTokens = 0
      const generate = async (extraSystem?: string): Promise<string> => {
        const response = await claude.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          thinking: { type: 'disabled' },
          output_config: { effort: 'low' },
          system: extraSystem ? `${system}\n\n## Correction\n${extraSystem}` : system,
          messages: [{ role: 'user', content: userPrompt }],
        })
        inputTokens += response.usage.input_tokens
        outputTokens += response.usage.output_tokens
        return textOf(response)
      }

      // Layer 3 — directive lint: one corrective regen, then safe fallback.
      let brief = await generate()
      const hit = lintDirectives(brief)
      if (hit) {
        console.error(`[morning-brief] lint hit "${hit}" — regenerating`)
        brief = await generate(REGENERATE_INSTRUCTION)
        if (lintDirectives(brief)) {
          console.error('[morning-brief] second lint hit — safe fallback used')
          brief = SAFE_FALLBACK
        }
      }

      // Deterministic disclaimer (GUARDRAILS Layer 3.3) — never model-dependent.
      const content = `${brief}\n\n${STANDARD_DISCLAIMER}`

      // Send via pre-approved template (proactive, outside the 24h window).
      const delivery = whatsappConfigured()
        ? await sendWhatsAppTemplate(member.phone!, MORNING_BRIEF_TEMPLATE, [content])
        : { sent: false, error: 'whatsapp_not_configured' }

      await admin.from('nudge_log').insert({
        user_id: member.user_id,
        nudge_type: 'morning_brief',
        content,
        market_context: cacheRow.parsed_context ?? { cache_date: cacheDate },
        delivered: delivery.sent,
        delivered_at: delivery.sent ? new Date().toISOString() : null,
        whatsapp_message_id: delivery.messageId ?? null,
      })

      const usd = costUsd(inputTokens, outputTokens)
      await admin.from('api_usage').insert({
        service: 'claude',
        operation: 'morning_brief',
        user_id: member.user_id,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: usd,
        cost_inr: usd * USD_TO_INR,
      })

      return delivery.sent ? 'sent' : 'logged_undelivered'
    } catch (err) {
      console.error(`[morning-brief] member ${member.user_id} failed:`, err)
      return 'failed'
    }
  })

  const sent = outcomes.filter((o) => o === 'sent').length
  const loggedUndelivered = outcomes.filter((o) => o === 'logged_undelivered').length
  const failed = outcomes.filter((o) => o === 'failed').length

  return NextResponse.json({
    ok: true,
    date: cacheDate,
    members: members.length,
    skipped: members.length - pending.length,
    sent,
    loggedUndelivered,
    failed,
    whatsapp: whatsappConfigured() ? 'live' : 'not_configured',
  })
}
