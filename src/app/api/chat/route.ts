import { NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server'
import { CLAUDE_MODEL, getClaude, costUsd, USD_TO_INR } from '@/lib/claude'
import { buildSystemPrompt, type MemberContext } from '@/lib/chat-prompt'
import {
  lintDirectives,
  stripMarkdown,
  REGENERATE_INSTRUCTION,
  SAFE_FALLBACK,
  RATE_LIMIT_MESSAGE,
} from '@/lib/guardrails'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DAILY_QUESTION_LIMIT = 5
const MAX_MESSAGE_CHARS = 2000

interface StoredMessage {
  role: 'user' | 'assistant'
  content: string
  at: string
}

// Start of the current IST day, as a UTC instant (rate-limit + session window).
function istDayStartUtc(): Date {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
  const nowIst = new Date(Date.now() + IST_OFFSET_MS)
  const dayStartIst = Date.UTC(
    nowIst.getUTCFullYear(),
    nowIst.getUTCMonth(),
    nowIst.getUTCDate(),
  )
  return new Date(dayStartIst - IST_OFFSET_MS)
}

function textOf(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
}

async function logUsage(
  userId: string,
  operation: string,
  inputTokens: number,
  outputTokens: number,
) {
  const admin = getSupabaseAdmin()
  if (!admin) return
  const usd = costUsd(inputTokens, outputTokens)
  await admin.from('api_usage').insert({
    service: 'claude',
    operation,
    user_id: userId,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: usd,
    cost_inr: usd * USD_TO_INR,
  })
}

export async function POST(request: Request) {
  const supabase = getSupabaseServer()
  const claude = getClaude()
  if (!supabase || !claude) {
    return NextResponse.json(
      { error: 'Chat is not configured on this deployment yet.' },
      { status: 503 },
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const message: unknown = body?.message
  if (typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Empty message.' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: 'That message is a little long — could you shorten it?' },
      { status: 400 },
    )
  }

  const dayStart = istDayStartUtc().toISOString()

  // --- Today's session (one per IST day; the thread carries over via summary)
  const { data: todaySession } = await supabase
    .from('chat_sessions')
    .select('id, messages, token_count')
    .gte('created_at', dayStart)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let sessionId: string
  let history: StoredMessage[] = []
  let carrySummary: string | null = null

  if (todaySession) {
    sessionId = todaySession.id
    history = (todaySession.messages ?? []) as StoredMessage[]
  } else {
    // New day — summarise the previous session for continuity, then start fresh.
    const { data: prevSession } = await supabase
      .from('chat_sessions')
      .select('id, messages, session_summary')
      .lt('created_at', dayStart)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (prevSession) {
      carrySummary = prevSession.session_summary
      const prevMessages = (prevSession.messages ?? []) as StoredMessage[]
      if (!carrySummary && prevMessages.length > 0) {
        const transcript = prevMessages
          .map((m) => `${m.role === 'user' ? 'Member' : 'PaisaJag'}: ${m.content}`)
          .join('\n')
          .slice(0, 12000)
        const summaryResponse = await claude.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 300,
          thinking: { type: 'disabled' },
          output_config: { effort: 'low' },
          system:
            'Summarise this personal-finance conversation in under 120 words, ' +
            'in third person, capturing what was discussed and any follow-ups ' +
            'the member wanted. Information only — no advice.',
          messages: [{ role: 'user', content: transcript }],
        })
        carrySummary = textOf(summaryResponse)
        await logUsage(
          user.id,
          'chat_summary',
          summaryResponse.usage.input_tokens,
          summaryResponse.usage.output_tokens,
        )
        await supabase
          .from('chat_sessions')
          .update({ session_summary: carrySummary })
          .eq('id', prevSession.id)
      }
    }

    const { data: created, error: createError } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, messages: [] })
      .select('id')
      .single()
    if (createError || !created) {
      return NextResponse.json(
        { error: 'We could not start the conversation. Please try again.' },
        { status: 500 },
      )
    }
    sessionId = created.id
  }

  // --- Rate limit: 5 member questions per IST day (decision: 12 Jun 2026)
  const used = history.filter((m) => m.role === 'user').length
  if (used >= DAILY_QUESTION_LIMIT) {
    return NextResponse.json({ reply: RATE_LIMIT_MESSAGE, remaining: 0, limited: true })
  }

  // --- Member context (RLS-scoped — only this member's rows can come back)
  const [profileRes, invRes, liaRes, goalRes] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'full_name, age, life_stage, risk_profile, employment_type, income_range, marital_status, dependents_count, tax_slab',
      )
      .maybeSingle(),
    supabase
      .from('investments')
      .select('fund_name, fund_type, invested_amount, current_value, monthly_sip_amount, plan_type'),
    supabase
      .from('liabilities')
      .select('liability_type, lender_name, outstanding_amount, emi_amount, interest_rate'),
    supabase
      .from('goals')
      .select('goal_name, target_amount, target_date, current_savings')
      .eq('status', 'active'),
  ])

  const p = profileRes.data
  const ctx: MemberContext = {
    fullName: p?.full_name ?? 'Member',
    age: p?.age ?? null,
    lifeStage: p?.life_stage ?? '',
    riskProfile: p?.risk_profile ?? '',
    employmentType: p?.employment_type ?? '',
    incomeRange: p?.income_range ?? '',
    maritalStatus: p?.marital_status ?? '',
    dependentsCount: p?.dependents_count ?? 0,
    taxSlab: p?.tax_slab ?? '',
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

  let system = buildSystemPrompt(ctx)
  if (carrySummary) {
    system += `\n\n<previous_session_summary>\n${carrySummary}\n</previous_session_summary>`
  }

  const turns: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: message },
  ]

  let totalInput = 0
  let totalOutput = 0

  async function generate(extraSystem?: string): Promise<string> {
    const response = await claude!.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: extraSystem ? `${system}\n\n## Correction\n${extraSystem}` : system,
      messages: turns,
    })
    totalInput += response.usage.input_tokens
    totalOutput += response.usage.output_tokens
    return textOf(response)
  }

  let reply: string
  try {
    reply = await generate()
    // Layer 3 — output lint. One corrective regeneration, then safe fallback.
    const hit = lintDirectives(reply)
    if (hit) {
      console.error(`[guardrail] directive lint hit: "${hit}" — regenerating`)
      reply = await generate(REGENERATE_INSTRUCTION)
      const secondHit = lintDirectives(reply)
      if (secondHit) {
        console.error(`[guardrail] second lint hit: "${secondHit}" — fallback used`)
        reply = SAFE_FALLBACK
      }
    }
  } catch (err) {
    console.error('[chat] Claude call failed:', err)
    return NextResponse.json(
      { error: 'We could not reach our reasoning engine. Please try again in a moment.' },
      { status: 502 },
    )
  }

  // The chat bubble renders plain text only — strip any markdown the model
  // emitted before it reaches the member (and before we store it).
  reply = stripMarkdown(reply)

  const now = new Date().toISOString()
  const newHistory: StoredMessage[] = [
    ...history,
    { role: 'user', content: message, at: now },
    { role: 'assistant', content: reply, at: now },
  ]
  await supabase
    .from('chat_sessions')
    .update({
      messages: newHistory,
      token_count: (todaySession?.token_count ?? 0) + totalInput + totalOutput,
    })
    .eq('id', sessionId)

  await logUsage(user.id, 'chat', totalInput, totalOutput)

  return NextResponse.json({
    reply,
    remaining: DAILY_QUESTION_LIMIT - used - 1,
  })
}
