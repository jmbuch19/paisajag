import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Daily NAV refresh (SPEC.md Phase 2) — runs via Vercel cron at 6:00 IST.
// For every linked investment (scheme_code + units present), fetches the
// latest NAV from mfapi.in once per scheme and recomputes current_value.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const { data: investments, error } = await admin
    .from('investments')
    .select('id, scheme_code, units')
    .not('scheme_code', 'is', null)
    .not('units', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!investments || investments.length === 0) {
    return NextResponse.json({ updated: 0, failed: 0, note: 'no linked investments' })
  }

  // One fetch per distinct scheme, shared across members.
  const schemeCodes = Array.from(new Set(investments.map((i) => i.scheme_code as string)))
  const navByScheme = new Map<string, number>()

  await Promise.all(
    schemeCodes.map(async (code) => {
      try {
        const res = await fetch(`https://api.mfapi.in/mf/${code}/latest`)
        if (!res.ok) return
        const data = await res.json()
        const nav = Number(data?.data?.[0]?.nav)
        if (nav && !Number.isNaN(nav)) navByScheme.set(code, nav)
      } catch {
        // scheme stays stale this run; tomorrow's run retries
      }
    }),
  )

  const now = new Date().toISOString()
  let updated = 0
  let failed = 0

  for (const inv of investments) {
    const nav = navByScheme.get(inv.scheme_code as string)
    if (!nav) {
      failed++
      continue
    }
    const { error: updateError } = await admin
      .from('investments')
      .update({
        last_nav: nav,
        nav_updated_at: now,
        current_value: Math.round(Number(inv.units) * nav * 100) / 100,
      })
      .eq('id', inv.id)
    if (updateError) failed++
    else updated++
  }

  return NextResponse.json({ updated, failed, schemes: schemeCodes.length })
}
