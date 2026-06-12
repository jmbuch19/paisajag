// Maps Financial DNA wizard answers (src/app/onboarding) to a profiles row.
// The wizard asks in human terms (age bands, "3 or more"); the schema stores
// scalars. life_stage and risk_profile are computed by a DB trigger — never
// written from the client.

export type DnaAnswers = Record<string, string>

// Band midpoints — the compute_profile_dna trigger only needs which side of
// 35/54 the age falls on, and every band sits cleanly inside one stage.
const AGE_BAND_MIDPOINT: Record<string, number> = {
  under_25: 22,
  '25_35': 30,
  '36_45': 40,
  '46_54': 50,
  '55_65': 60,
  above_65: 70,
}

export function dnaToProfileRow(dna: DnaAnswers, userId: string, fullName: string) {
  return {
    user_id: userId,
    full_name: fullName.trim(),
    age: AGE_BAND_MIDPOINT[dna.age_band] ?? null,
    family_role: dna.family_role ?? null,
    employment_type: dna.employment_type ?? null,
    income_range: dna.income_range ?? null,
    income_stability: dna.income_stability ?? null,
    marital_status: dna.marital_status ?? null,
    dependents_count: dna.dependents === '3_plus' ? 3 : Number(dna.dependents ?? 0),
    major_upcoming_expenses:
      dna.major_expense && dna.major_expense !== 'none' ? [dna.major_expense] : [],
    covid_crash_behaviour: dna.covid_crash_behaviour ?? null,
    can_afford_20pct_loss: dna.can_afford_20pct_loss ?? null,
    investment_horizon_years: dna.investment_horizon
      ? Number(dna.investment_horizon)
      : null,
    tax_slab: dna.tax_slab ?? null,
    elss_done: dna.elss_done === 'yes',
    section_80c_exhausted: dna.section_80c_exhausted === 'yes',
    dna_complete: true,
    dna_completed_at: new Date().toISOString(),
  }
}
