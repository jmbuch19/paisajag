'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import {
  mockMember,
  mockInvestments,
  mockLiabilities,
  mockGoals,
  type Investment,
  type Liability,
  type Goal,
} from '@/lib/mock-data'

// Live member data for client screens. In preview mode (no Supabase envs)
// falls back to the mock dataset so the UI stays browsable.
// Fund health stays 'healthy' until the Phase 2 health indicators land —
// the DB has no health columns yet.

export interface MemberData {
  loading: boolean
  live: boolean // false = preview/mock data
  member: { fullName: string; dnaComplete: boolean }
  investments: Investment[]
  liabilities: Liability[]
  goals: Goal[]
}

const PREVIEW: MemberData = {
  loading: false,
  live: false,
  member: { fullName: mockMember.fullName, dnaComplete: mockMember.dnaComplete },
  investments: mockInvestments,
  liabilities: mockLiabilities,
  goals: mockGoals,
}

export function useMemberData(): MemberData {
  const supabase = getSupabaseBrowser()
  const [data, setData] = useState<MemberData>(
    supabase ? { ...PREVIEW, loading: true, live: true, investments: [], liabilities: [], goals: [], member: { fullName: '', dnaComplete: false } } : PREVIEW,
  )

  useEffect(() => {
    if (!supabase) return
    let cancelled = false

    async function load() {
      const [profileRes, invRes, liaRes, goalRes] = await Promise.all([
        supabase!.from('profiles').select('full_name, dna_complete').maybeSingle(),
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
      ])
      if (cancelled) return

      setData({
        loading: false,
        live: true,
        member: {
          fullName: profileRes.data?.full_name ?? '',
          dnaComplete: profileRes.data?.dna_complete ?? false,
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
      })
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return data
}
