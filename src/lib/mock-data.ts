// Preview data for all member screens until the backend (API routes +
// Supabase) lands. Each screen reads from here through a single import,
// so swapping to real data means replacing these exports with fetches.

export type FundHealth = 'healthy' | 'watch' | 'concern'

export interface Investment {
  id: string
  fundName: string
  fundType: string
  investedAmount: number
  currentValue: number
  monthlySip: number | null
  planType: 'direct' | 'regular' | 'unknown'
  health: FundHealth
  healthNote: string
}

export interface Liability {
  id: string
  liabilityType: string
  lenderName: string
  outstandingAmount: number
  emiAmount: number | null
  interestRate: number | null
  remainingTenureMonths: number | null
}

export interface Goal {
  id: string
  goalName: string
  goalType: string
  targetAmount: number
  targetDate: string
  currentSavings: number
  monthlyContribution: number | null
  status: 'active' | 'achieved' | 'paused'
}

export interface Nudge {
  id: string
  nudgeType: 'morning_brief' | 'evening_alert' | 'goal_milestone'
  deliveredAt: string
  content: string
}

export const mockMember = {
  fullName: 'Asha Patel',
  phone: '+91 98XXX XXX21',
  age: 42,
  city: 'Ahmedabad',
  lifeStage: 'mid_career',
  riskProfile: 'moderate',
  dnaComplete: true,
}

export const mockInvestments: Investment[] = [
  {
    id: 'inv-1',
    fundName: 'HDFC Flexi Cap Fund',
    fundType: 'equity_flexicap',
    investedAmount: 480_000,
    currentValue: 612_000,
    monthlySip: 10_000,
    planType: 'regular',
    health: 'watch',
    healthNote:
      'This fund has been slightly below its benchmark for a while. Worth knowing.',
  },
  {
    id: 'inv-2',
    fundName: 'UTI Nifty 50 Index Fund',
    fundType: 'index',
    investedAmount: 360_000,
    currentValue: 451_000,
    monthlySip: 8_000,
    planType: 'direct',
    health: 'healthy',
    healthNote: 'Tracking its index closely. Running quietly in the background.',
  },
  {
    id: 'inv-3',
    fundName: 'SBI Small Cap Fund',
    fundType: 'equity_smallcap',
    investedAmount: 240_000,
    currentValue: 318_000,
    monthlySip: 5_000,
    planType: 'regular',
    health: 'healthy',
    healthNote: 'Performing in line with its category.',
  },
  {
    id: 'inv-4',
    fundName: 'PPF Account',
    fundType: 'ppf',
    investedAmount: 550_000,
    currentValue: 643_000,
    monthlySip: null,
    planType: 'unknown',
    health: 'healthy',
    healthNote: 'Steady, government-backed. The quiet anchor of your portfolio.',
  },
]

export const mockLiabilities: Liability[] = [
  {
    id: 'lia-1',
    liabilityType: 'home_loan',
    lenderName: 'SBI Home Loans',
    outstandingAmount: 1_850_000,
    emiAmount: 24_500,
    interestRate: 8.5,
    remainingTenureMonths: 132,
  },
  {
    id: 'lia-2',
    liabilityType: 'car_loan',
    lenderName: 'HDFC Bank',
    outstandingAmount: 280_000,
    emiAmount: 9_800,
    interestRate: 9.2,
    remainingTenureMonths: 34,
  },
]

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    goalName: "Meera's Education",
    goalType: 'education',
    targetAmount: 2_500_000,
    targetDate: '2032-06-01',
    currentSavings: 680_000,
    monthlyContribution: 12_000,
    status: 'active',
  },
  {
    id: 'goal-2',
    goalName: 'Retirement',
    goalType: 'retirement',
    targetAmount: 30_000_000,
    targetDate: '2044-01-01',
    currentSavings: 2_024_000,
    monthlyContribution: 23_000,
    status: 'active',
  },
]

export const mockNudges: Nudge[] = [
  {
    id: 'nudge-1',
    nudgeType: 'morning_brief',
    deliveredAt: '2026-06-10T06:30:00+05:30',
    content:
      '🌍 Overnight World\nUS markets closed slightly higher. Asian markets opened steady. Crude eased a little.\n\n📊 What This Means For You\nYour funds are largely domestic — global moves have limited direct effect on your portfolio today.\n\n💡 For Your Awareness\nYour SIPs are running quietly in the background — working for you every month.',
  },
  {
    id: 'nudge-2',
    nudgeType: 'morning_brief',
    deliveredAt: '2026-06-09T06:30:00+05:30',
    content:
      '🌍 Overnight World\nQuiet night globally. Nothing material for Indian markets.\n\n📊 What This Means For You\nYour portfolio is on track.\n\n💡 For Your Awareness\nHave a good day.',
  },
  {
    id: 'nudge-3',
    nudgeType: 'evening_alert',
    deliveredAt: '2026-06-05T20:15:00+05:30',
    content:
      '📋 What Happened\nA large bank in your largecap fund reported results below expectations this evening.\n\n📊 Your Exposure\nHDFC Flexi Cap Fund holds this stock. Estimated portfolio impact: around 0.6%.\n\n💡 For Your Awareness\nSingle-quarter results rarely change a fund’s long-term story. Your fund manager has seen many such evenings.\n\nSleep well. Full picture at 6:30am.',
  },
]

export const mockAdminMetrics = {
  totalMembers: 14,
  activeThisWeek: 11,
  dnaCompleteCount: 12,
  newSignupsToday: 1,
  claudeCostInr: 412.5,
  perplexityCostInr: 86.2,
  whatsappCostInr: 218.0,
  totalCostInr: 716.7,
  costPerMemberInr: 51.2,
  morningBriefsSent: 308,
  morningBriefsDelivered: 305,
  eveningAlertsSent: 9,
  silenceFilterBlocked: 47,
  pendingDeletions: 0,
}

export function totalAssets(): number {
  return mockInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
}

export function totalLiabilities(): number {
  return mockLiabilities.reduce((sum, l) => sum + l.outstandingAmount, 0)
}

export function netWorth(): number {
  return totalAssets() - totalLiabilities()
}
