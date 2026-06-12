import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Latest NAV for one scheme — used at investment-save time to derive units.
export async function GET(
  _request: Request,
  { params }: { params: { code: string } },
) {
  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!/^\d{4,8}$/.test(params.code)) {
    return NextResponse.json({ error: 'Invalid scheme code' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${params.code}/latest`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return NextResponse.json({ error: 'Fund not found' }, { status: 404 })
    const data = await res.json()
    const nav = Number(data?.data?.[0]?.nav)
    if (!nav || Number.isNaN(nav)) {
      return NextResponse.json({ error: 'No NAV available' }, { status: 404 })
    }
    return NextResponse.json({
      schemeCode: data.meta?.scheme_code,
      schemeName: data.meta?.scheme_name,
      fundHouse: data.meta?.fund_house,
      nav,
      date: data.data[0].date,
    })
  } catch {
    return NextResponse.json({ error: 'NAV source unreachable' }, { status: 502 })
  }
}
