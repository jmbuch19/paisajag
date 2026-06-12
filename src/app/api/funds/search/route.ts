import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Auth-gated proxy to mfapi.in fund search — keeps the third-party call
// server-side and away from anonymous abuse.
export async function GET(request: Request) {
  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json([], { status: 200 })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''
  if (q.length < 3) return NextResponse.json([])

  try {
    const res = await fetch(
      `https://api.mfapi.in/mf/search?q=${encodeURIComponent(q).replace(/%20/g, '+')}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return NextResponse.json([])
    const results: { schemeCode: number; schemeName: string }[] = await res.json()
    return NextResponse.json(results.slice(0, 15))
  } catch {
    return NextResponse.json([])
  }
}
