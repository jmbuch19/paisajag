-- PaisaJag — initial schema
-- Source of truth: D:\paisajag\docs\SPEC.md § Database Schema
-- Deviations from the spec are marked with "-- DEVIATION:" comments.

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Financial DNA
  age INTEGER,
  gender TEXT CHECK (gender IN ('male','female','other','prefer_not_to_say')),
  city TEXT,
  family_role TEXT CHECK (family_role IN ('self','spouse','parent','child','other')),

  -- Income
  employment_type TEXT CHECK (employment_type IN (
    'salaried_private','salaried_govt','business',
    'freelance','retired','homemaker','student'
  )),
  income_range TEXT CHECK (income_range IN (
    'under_25k','25k_50k','50k_1l','1l_2.5l','above_2.5l'
  )),
  income_stability TEXT CHECK (income_stability IN (
    'very_stable','somewhat_variable','highly_variable'
  )),
  other_income_sources TEXT[],

  -- Life stage
  marital_status TEXT CHECK (marital_status IN ('single','married','widowed','divorced')),
  dependents_count INTEGER DEFAULT 0,
  major_upcoming_expenses TEXT[],

  -- Risk temperament
  covid_crash_behaviour TEXT CHECK (covid_crash_behaviour IN (
    'panic_sold','stayed','bought_more','not_invested'
  )),
  can_afford_20pct_loss TEXT CHECK (can_afford_20pct_loss IN ('yes','no','unsure')),
  investment_horizon_years INTEGER,

  -- Tax context
  tax_slab TEXT CHECK (tax_slab IN ('nil','5pct','20pct','30pct')),
  elss_done BOOLEAN DEFAULT false,
  section_80c_exhausted BOOLEAN DEFAULT false,

  -- Computed (updated by trigger — see compute_profile_dna below)
  life_stage TEXT CHECK (life_stage IN (
    'early_career','mid_career','pre_retirement','retired'
  )),
  risk_profile TEXT CHECK (risk_profile IN ('conservative','moderate','aggressive')),

  -- DNA completion
  dna_complete BOOLEAN DEFAULT false,
  dna_completed_at TIMESTAMPTZ,

  -- Subscription
  subscription_status TEXT DEFAULT 'complimentary' CHECK (subscription_status IN (
    'complimentary','founding','individual','family','expired','cancelled'
  )),
  subscription_expires_at TIMESTAMPTZ,

  -- WhatsApp
  whatsapp_nudges_enabled BOOLEAN DEFAULT true,
  whatsapp_evening_alerts_enabled BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  last_session_check_done BOOLEAN DEFAULT false
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- investments
-- ============================================================
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Fund details
  fund_name TEXT NOT NULL,
  fund_type TEXT CHECK (fund_type IN (
    'equity_largecap','equity_midcap','equity_smallcap',
    'equity_flexicap','equity_elss','equity_sectoral',
    'debt_liquid','debt_shortterm','debt_longterm',
    'hybrid_balanced','hybrid_aggressive','index',
    'gold_etf','international','fd','ppf','epf','nps',
    'gold_physical','real_estate','stocks','other'
  )),
  investment_mode TEXT CHECK (investment_mode IN ('sip','lumpsum','both')),

  -- Amounts
  invested_amount NUMERIC(15,2),
  current_value NUMERIC(15,2),
  monthly_sip_amount NUMERIC(10,2),
  sip_start_date DATE,

  -- Plan type
  plan_type TEXT CHECK (plan_type IN ('direct','regular','unknown')) DEFAULT 'unknown',

  -- NAV tracking
  units NUMERIC(15,4),
  last_nav NUMERIC(10,4),
  nav_updated_at TIMESTAMPTZ,

  -- Notes
  folio_number TEXT,
  amc_name TEXT,
  scheme_code TEXT,
  notes TEXT
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_investments" ON investments
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- liabilities
-- ============================================================
CREATE TABLE liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  liability_type TEXT CHECK (liability_type IN (
    'home_loan','car_loan','personal_loan','education_loan',
    'credit_card','business_loan','gold_loan','informal','other'
  )) NOT NULL,
  lender_name TEXT,
  outstanding_amount NUMERIC(15,2) NOT NULL,
  emi_amount NUMERIC(10,2),
  interest_rate NUMERIC(5,2),
  remaining_tenure_months INTEGER,
  start_date DATE,
  notes TEXT
);

ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_liabilities" ON liabilities
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- goals
-- ============================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  goal_name TEXT NOT NULL,
  goal_type TEXT CHECK (goal_type IN (
    'retirement','education','marriage','home','vehicle',
    'emergency_fund','travel','medical','other'
  )),
  target_amount NUMERIC(15,2) NOT NULL,
  target_date DATE,
  current_savings NUMERIC(15,2) DEFAULT 0,
  monthly_contribution NUMERIC(10,2),
  linked_investment_ids UUID[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active','achieved','paused','cancelled'))
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- chat_sessions
-- ============================================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  messages JSONB NOT NULL DEFAULT '[]',
  session_summary TEXT,
  portfolio_changes_detected BOOLEAN DEFAULT false,
  changes_applied BOOLEAN DEFAULT false,
  token_count INTEGER DEFAULT 0
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_chat_sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- simulations
-- ============================================================
CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  scenario_type TEXT CHECK (scenario_type IN (
    'sip_change','scenario_compare','sip_pause','lumpsum_addition','rebalance'
  )) NOT NULL,
  parameters JSONB NOT NULL,
  before_state JSONB NOT NULL,
  after_state JSONB NOT NULL,
  claude_commentary TEXT,
  assumption_rate NUMERIC(5,2) DEFAULT 12.00
);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_simulations" ON simulations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- nudge_log
-- ============================================================
CREATE TABLE nudge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  nudge_type TEXT CHECK (nudge_type IN (
    'morning_brief','evening_alert','goal_milestone'
  )) NOT NULL,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  whatsapp_message_id TEXT,
  content TEXT NOT NULL,
  market_context JSONB,
  silence_filter_passed BOOLEAN DEFAULT true,
  silence_filter_reason TEXT
);

ALTER TABLE nudge_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_nudge_log" ON nudge_log
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- permission_grants
-- ============================================================
CREATE TABLE permission_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grantor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grantee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_type TEXT CHECK (permission_type IN ('aggregate_view','full_view')) NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  access_log JSONB DEFAULT '[]'
);

ALTER TABLE permission_grants ENABLE ROW LEVEL SECURITY;

-- Grantor has full control over their own grants
CREATE POLICY "grantor_full_control" ON permission_grants
  FOR ALL
  USING (auth.uid() = grantor_user_id)
  WITH CHECK (auth.uid() = grantor_user_id);

-- Grantee can only READ active grants where they are the recipient.
-- Grantee cannot insert, update, or delete grant records.
CREATE POLICY "grantee_read_active_only" ON permission_grants
  FOR SELECT
  USING (auth.uid() = grantee_user_id AND is_active = true);

-- ============================================================
-- otp_store (WhatsApp OTP — short lived)
-- Accessed via service role only from API routes.
-- Cleanup: row deleted immediately on successful verify.
-- Safety: expires_at checked on every verify attempt; max 5 attempts.
-- ============================================================
CREATE TABLE otp_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0
);

-- DEVIATION: spec says "No RLS — service role only", but in Supabase a table
-- without RLS is readable/writable through the public REST API with the anon
-- key. Enabling RLS with NO policies locks it to everyone except the service
-- role (which bypasses RLS). Same applies to api_usage, market_context_cache
-- and admin_metrics below.
ALTER TABLE otp_store ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_otp_store_phone ON otp_store(phone);

-- ============================================================
-- api_usage (cost tracking)
-- Admin read via service role only. user_id nullable: cron jobs log NULL.
-- ============================================================
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  service TEXT NOT NULL CHECK (service IN ('claude','perplexity','whatsapp','alpha_vantage')),
  operation TEXT NOT NULL,           -- e.g. 'morning_brief', 'evening_alert', 'chat'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd NUMERIC(10,6),
  cost_inr NUMERIC(10,4)
);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;  -- DEVIATION: see otp_store note

CREATE INDEX idx_api_usage_date ON api_usage(recorded_at);
CREATE INDEX idx_api_usage_service ON api_usage(service);

-- ============================================================
-- market_context_cache (shared across all member nudges)
-- One row per day. Morning brief cron reads this instead of
-- calling Perplexity per member.
-- ============================================================
CREATE TABLE market_context_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_date DATE NOT NULL UNIQUE,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  raw_context TEXT NOT NULL,           -- Perplexity response
  parsed_context JSONB,                -- structured: indices, events, sentiment
  expires_at TIMESTAMPTZ NOT NULL      -- 24 hours from fetch
);

ALTER TABLE market_context_cache ENABLE ROW LEVEL SECURITY;  -- DEVIATION: see otp_store note

CREATE INDEX idx_market_cache_date ON market_context_cache(cache_date);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  plan TEXT NOT NULL CHECK (plan IN (
    'complimentary','founding','individual','family'
  )) DEFAULT 'complimentary',
  status TEXT NOT NULL CHECK (status IN (
    'active','expired','cancelled','grace_period'
  )) DEFAULT 'active',

  -- Razorpay references (populated Month 7+)
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,

  -- Dates
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,              -- NULL = complimentary, no expiry yet
  cancelled_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ,

  -- Family plan
  is_family_admin BOOLEAN DEFAULT false,
  family_admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Founding lock
  founding_locked BOOLEAN DEFAULT false   -- true = price never changes
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
-- Mutations only via service role (payment webhook, admin)

-- ============================================================
-- deletion_requests
-- ============================================================
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed')),
  completed_at TIMESTAMPTZ,
  confirmation_sent BOOLEAN DEFAULT false
);

ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_deletion_requests" ON deletion_requests
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- legal_acknowledgements
-- ============================================================
CREATE TABLE legal_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  document_version TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE legal_acknowledgements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_acknowledgements" ON legal_acknowledgements
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- admin_metrics (admin only via service role)
-- ============================================================
CREATE TABLE admin_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  metric_date DATE NOT NULL,

  -- Member counts (no PII)
  total_members INTEGER DEFAULT 0,
  active_this_week INTEGER DEFAULT 0,
  dna_complete_count INTEGER DEFAULT 0,
  new_signups_today INTEGER DEFAULT 0,

  -- API costs
  claude_api_cost_inr NUMERIC(10,2) DEFAULT 0,
  perplexity_api_cost_inr NUMERIC(10,2) DEFAULT 0,
  whatsapp_cost_inr NUMERIC(10,2) DEFAULT 0,
  total_cost_inr NUMERIC(10,2) DEFAULT 0,
  cost_per_member_inr NUMERIC(10,2) DEFAULT 0,

  -- Nudge performance
  morning_briefs_sent INTEGER DEFAULT 0,
  morning_briefs_delivered INTEGER DEFAULT 0,
  evening_alerts_sent INTEGER DEFAULT 0,
  silence_filter_blocked INTEGER DEFAULT 0,

  -- Deletion requests
  pending_deletions INTEGER DEFAULT 0
);

ALTER TABLE admin_metrics ENABLE ROW LEVEL SECURITY;  -- DEVIATION: see otp_store note

-- ============================================================
-- Indexes on RLS filter columns
-- DEVIATION (addition): not in spec. Every per-member policy filters on
-- user_id; without these indexes each RLS check is a sequential scan.
-- ============================================================
CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_liabilities_user ON liabilities(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_simulations_user ON simulations(user_id);
CREATE INDEX idx_nudge_log_user ON nudge_log(user_id);
CREATE INDEX idx_permission_grants_grantor ON permission_grants(grantor_user_id);
CREATE INDEX idx_permission_grants_grantee ON permission_grants(grantee_user_id);
CREATE INDEX idx_deletion_requests_user ON deletion_requests(user_id);
CREATE INDEX idx_legal_acknowledgements_user ON legal_acknowledgements(user_id);

-- ============================================================
-- updated_at maintenance
-- DEVIATION (addition): spec declares updated_at columns but no mechanism.
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at      BEFORE UPDATE ON profiles      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_investments_updated_at   BEFORE UPDATE ON investments   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_liabilities_updated_at   BEFORE UPDATE ON liabilities   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_goals_updated_at         BEFORE UPDATE ON goals         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Computed DNA fields: life_stage + risk_profile
-- The spec marks these "updated by trigger" but does not define the rules.
-- REVIEW REQUIRED — proposed rules below; adjust before applying.
--
-- life_stage (age bands from MEMORY.md "Age-Based Tone Variation"):
--   employment_type = 'retired'  -> 'retired'
--   age <= 35                    -> 'early_career'
--   age 36-54                    -> 'mid_career'
--   age >= 55                    -> 'pre_retirement'
--
-- risk_profile (simple score from the three risk-temperament answers):
--   covid_crash_behaviour: bought_more +1, stayed 0, not_invested 0, panic_sold -1
--   can_afford_20pct_loss: yes +1, unsure 0, no -1
--   investment_horizon_years: >7 +1, 3-7 0, <3 -1
--   total >= 2 -> aggressive | total <= -1 -> conservative | else moderate
-- ============================================================
CREATE OR REPLACE FUNCTION compute_profile_dna()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- life_stage
  IF NEW.employment_type = 'retired' THEN
    NEW.life_stage := 'retired';
  ELSIF NEW.age IS NOT NULL THEN
    NEW.life_stage := CASE
      WHEN NEW.age <= 35 THEN 'early_career'
      WHEN NEW.age <= 54 THEN 'mid_career'
      ELSE 'pre_retirement'
    END;
  END IF;

  -- risk_profile (only once all three inputs are present)
  IF NEW.covid_crash_behaviour IS NOT NULL
     AND NEW.can_afford_20pct_loss IS NOT NULL
     AND NEW.investment_horizon_years IS NOT NULL THEN
    score := score + CASE NEW.covid_crash_behaviour
      WHEN 'bought_more' THEN 1 WHEN 'panic_sold' THEN -1 ELSE 0 END;
    score := score + CASE NEW.can_afford_20pct_loss
      WHEN 'yes' THEN 1 WHEN 'no' THEN -1 ELSE 0 END;
    score := score + CASE
      WHEN NEW.investment_horizon_years > 7 THEN 1
      WHEN NEW.investment_horizon_years < 3 THEN -1 ELSE 0 END;

    NEW.risk_profile := CASE
      WHEN score >= 2 THEN 'aggressive'
      WHEN score <= -1 THEN 'conservative'
      ELSE 'moderate'
    END;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_compute_dna
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION compute_profile_dna();
