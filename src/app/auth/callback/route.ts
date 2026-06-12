import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

// Google OAuth callback — exchanges the auth code for a session, then
// routes new users to /onboarding and returning members to the dashboard
// with the since-last-session check-in.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const supabase = getSupabaseServer()

  if (!supabase || !code) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('dna_complete')
    .eq('user_id', data.session.user.id)
    .maybeSingle()

  if (profile) {
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', data.session.user.id)
  }

  const destination = profile?.dna_complete
    ? '/dashboard?check_in=true'
    : '/onboarding'
  return NextResponse.redirect(new URL(destination, url.origin))
}
