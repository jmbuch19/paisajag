import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { USD_TO_INR } from '@/lib/claude'
import {
  fetchOvernightMarketContext,
  perplexityConfigured,
} from '@/lib/perplexity'
import { fetchGlobalSnapshot } from '@/lib/market'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// IST calendar date as 'YYYY-MM-DD' — the market_context_cache key.
function istDateString(): string {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
  const nowIst = new Date(Date.now() + IST_OFFSET_MS)
  const y = nowIst.getUTCFullYear()
  const m = String(nowIst.getUTCMonth() + 1).padStart(2, '0')
  const d = String(nowIst.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Daily market context fetch (SPEC.md "Morning Brief — data fetch 6:00am IST").
// Runs 30 min before morning-brief. Calls Perplexity ONCE for the overnight
// narrative + Alpha Vantage (best-effort) for structured numbers, then caches a
// single row in market_context_cache that every member's brief reuses — so the
// expensive web call happens once, not once per member. Idempotent per IST day.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }
  if (!perplexityConfigured()) {
    // The narrative is the core of the brief; without it we cache nothing rather
    // than store an empty context the morning-brief cron would personalise off.
    console.error('[market-fetch] PERPLEXITY_API_KEY not set — nothing cached')
    return NextResponse.json(
      { ok: false, reason: 'perplexity_not_configured' },
      { status: 200 },
    )
  }

  const cacheDate = istDateString()

  // Idempotent — a retry on the same IST day must not re-call Perplexity.
  const { data: existing } = await admin
    .from('market_context_cache')
    .select('id')
    .eq('cache_date', cacheDate)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ ok: true, date: cacheDate, cached: 'already' })
  }

  // Narrative (required) + structured snapshot (best-effort, never throws).
  let narrative
  let snapshot
  try {
    ;[narrative, snapshot] = await Promise.all([
      fetchOvernightMarketContext(),
      fetchGlobalSnapshot(),
    ])
  } catch (err) {
    console.error('[market-fetch] context fetch failed:', err)
    return NextResponse.json(
      { ok: false, reason: 'fetch_failed', date: cacheDate },
      { status: 200 },
    )
  }

  if (!narrative) {
    return NextResponse.json(
      { ok: false, reason: 'no_narrative', date: cacheDate },
      { status: 200 },
    )
  }

  const parsedContext = {
    date: cacheDate,
    narrative: narrative.text,
    usd_inr: snapshot.usdInr,
    indices: snapshot.indices,
    sources: ['perplexity', ...(snapshot.indices.length || snapshot.usdInr ? ['alpha_vantage'] : [])],
  }

  const nowMs = Date.parse(new Date().toISOString())
  const expiresAt = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString()

  const { error: insertErr } = await admin.from('market_context_cache').insert({
    cache_date: cacheDate,
    raw_context: narrative.text,
    parsed_context: parsedContext,
    expires_at: expiresAt,
  })
  if (insertErr) {
    // A concurrent run may have won the UNIQUE(cache_date) race — that's fine.
    console.error('[market-fetch] insert failed:', insertErr.message)
    return NextResponse.json(
      { ok: false, reason: 'insert_failed', date: cacheDate, detail: insertErr.message },
      { status: 200 },
    )
  }

  // Cost tracking — one shared call attributed to no single member (user_id NULL).
  await admin.from('api_usage').insert({
    service: 'perplexity',
    operation: 'market_fetch',
    user_id: null,
    input_tokens: narrative.inputTokens,
    output_tokens: narrative.outputTokens,
    cost_usd: narrative.costUsd,
    cost_inr: narrative.costUsd * USD_TO_INR,
  })

  return NextResponse.json({
    ok: true,
    date: cacheDate,
    cached: 'new',
    usdInr: snapshot.usdInr,
    indices: snapshot.indices.length,
    costUsd: Number(narrative.costUsd.toFixed(4)),
  })
}
