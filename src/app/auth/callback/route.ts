import { NextResponse } from 'next/server'

// Google OAuth callback — TODO(backend): exchange the auth code for a
// Supabase session via @supabase/ssr, then route new users to /onboarding
// and returning users to /dashboard?check_in=true.
export async function GET(request: Request) {
  const url = new URL(request.url)
  return NextResponse.redirect(new URL('/onboarding', url.origin))
}
