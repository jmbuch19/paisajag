'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import {
  mockMember,
  mockInvestments,
  mockLiabilities,
  mockGoals,
  mockNudges,
  type Investment,
  type Liability,
  type Goal,
  type Nudge,
} from '@/lib/mock-data'

// Live member data for client screens. In preview mode (no Supabase envs)
// falls back to the mock dataset so the UI stays browsable.
// Fund health stays 'healthy' until the Phase 2 health indicators land —
// the DB has no health columns yet.

export interface MemberProfile {
  fullName: string
  dnaComplete: boolean
  phone: string
  city: string
  age: number | null
  lifeStage: string
  riskProfile: string
}

export interface MemberData {
  loading: boolean
  live: boolean // false = preview/mock data
  member: MemberProfile
  investments: Investment[]
  liabilities: Liability[]
  goals: Goal[]
  nudges: Nudge[]
  refresh: () => void
}

const EMPTY_MEMBER: MemberProfile = {
  fullName: '',
  dnaComplete: false,
  phone: '',
  city: '',
  age: null,
  lifeStage: '',
  riskProfile: '',
}

const PREVIEW: Omit<MemberData, 'refresh'> = {
  loading: false,
  live: false,
  member: {
    fullName: mockMember.fullName,
    dnaComplete: mockMember.dnaComplete,
    phone: mockMember.phone,
    city: mockMember.city,
    age: mockMember.age,
    lifeStage: mockMember.lifeStage,
    riskProfile: mockMember.riskProfile,
  },
  investments: mockInvestments,
  liabilities: mockLiabilities,
  goals: mockGoals,
  nudges: mockNudges,
}

export function useMemberData(): MemberData {
  const supabase = getSupabaseBrowser()
  const [version, setVersion] = useState(0)
  const [data, setData] = useState<Omit<MemberData, 'refresh'>>(
    supabase
      ? {
          ...PREVIEW,
          loading: true,
          live: true,
          member: EMPTY_MEMBER,
          investments: [],
          liabilities: [],
          goals: [],
          nudges: [],
        }
      : PREVIEW,
  )

  useEffect(() => {
    if (!supabase) return
    let cancelled = false

    async function load() {
      const [profileRes, invRes, liaRes, goalRes, nudgeRes] = await Promise.all([
        supabase!
          .from('profiles')
          .select('full_name, dna_complete, phone, city, age, life_stage, risk_profile')
          .maybeSingle(),
        supabase!
          .from('investments')
          .select(
            'id, fund_name, fund_type, invested_amount, current_value, monthly_sip_amount, plan_type',
          )
          .order('current_value', { ascending: false }),
        supabase!
          .from('liabilities')
          .select(
            'id, liability_type, lender_name, outstanding_amount, emi_amount, interest_rate, remaining_tenure_months',
          )
          .order('outstanding_amount', { ascending: false }),
        supabase!
          .from('goals')
          .select(
            'id, goal_name, goal_type, target_amount, target_date, current_savings, monthly_contribution, status',
          )
          .order('target_date', { ascending: true }),
        supabase!
          .from('nudge_log')
          .select('id, nudge_type, delivered_at, content')
          .eq('delivered', true)
          .order('delivered_at', { ascending: false })
          .limit(30),
      ])
      if (cancelled) return

      setData({
        loading: false,
        live: true,
        member: {
          fullName: profileRes.data?.full_name ?? '',
          dnaComplete: profileRes.data?.dna_complete ?? false,
          phone: profileRes.data?.phone ?? '',
          city: profileRes.data?.city ?? '',
          age: profileRes.data?.age ?? null,
          lifeStage: profileRes.data?.life_stage ?? '',
          riskProfile: profileRes.data?.risk_profile ?? '',
        },
        investments: (invRes.data ?? []).map((r) => ({
          id: r.id,
          fundName: r.fund_name,
          fundType: r.fund_type ?? 'other',
          investedAmount: Number(r.invested_amount ?? 0),
          currentValue: Number(r.current_value ?? 0),
          monthlySip: r.monthly_sip_amount ? Number(r.monthly_sip_amount) : null,
          planType: r.plan_type ?? 'unknown',
          health: 'healthy',
          healthNote: '',
        })),
        liabilities: (liaRes.data ?? []).map((r) => ({
          id: r.id,
          liabilityType: r.liability_type,
          lenderName: r.lender_name ?? '',
          outstandingAmount: Number(r.outstanding_amount ?? 0),
          emiAmount: r.emi_amount ? Number(r.emi_amount) : null,
          interestRate: r.interest_rate ? Number(r.interest_rate) : null,
          remainingTenureMonths: r.remaining_tenure_months,
        })),
        goals: (goalRes.data ?? []).map((r) => ({
          id: r.id,
          goalName: r.goal_name,
          goalType: r.goal_type ?? 'other',
          targetAmount: Number(r.target_amount ?? 0),
          targetDate: r.target_date ?? '',
          currentSavings: Number(r.current_savings ?? 0),
          monthlyContribution: r.monthly_contribution
            ? Number(r.monthly_contribution)
            : null,
          status: r.status ?? 'active',
        })),
        nudges: (nudgeRes.data ?? []).map((r) => ({
          id: r.id,
          nudgeType: r.nudge_type,
          deliveredAt: r.delivered_at ?? '',
          content: r.content,
        })),
      })
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  return { ...data, refresh: () => setVersion((v) => v + 1) }
}
