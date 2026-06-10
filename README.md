# PaisaJag

> Jag Paisa. Bhag Paisa. — Wake up your money.

Personal finance awareness and simulation platform for Indian families.
Information, never advice.

**Docs:** the product spec lives in `D:\paisajag\docs` — read `SPEC.md`,
`DESIGN.md`, `TECH_STACK.md` and `MEMORY.md` (decisions log) before changing
anything fundamental.

## Stack

Next.js 14 (App Router) · Tailwind v3 · PWA (next-pwa) · Supabase ·
Claude API · Meta Cloud API (WhatsApp) · Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (Doppler is source of truth)
npm run dev
```

The frontend renders fully in **preview mode** without any env vars — member
screens use mock data from `src/lib/mock-data.ts` and auth falls through to
the onboarding flow. Wiring the real backend replaces those imports with API
calls (grep for `TODO(backend)`).

## Status

- ✅ Frontend scaffold — all public, onboarding, member and admin screens
- ⏳ Backend — API routes, Supabase migrations, crons (in progress, separate)
- ⏳ WhatsApp templates — pending Meta approval
- ⏳ Legal copy — pending CA review (placeholders marked in-page)
- ✅ Brand — icons generated from the real logo mark (`public/logo.png` is
  the full lockup). Spelling is **PaisaJag** / paisajag.in — the docs'
  "PaisaJaag" spelling is outdated

## Rules that are easy to forget

- amber-600 `#C97B2A` is decorative only — never text on light backgrounds
- Font weights stop at 500 — never 600/700
- Amounts use Indian numbering (`src/lib/format.ts`) — ₹1,25,000, ₹12.5L, ₹1.2Cr
- Negative amounts get parentheses, not just a minus sign
- Every simulation/chat/nudge surface ends with the standard disclaimer
- The Kabir doha renders in Noto Serif Devanagari — never sans-serif
