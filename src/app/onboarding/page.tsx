'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLATFORM_NAME, STANDARD_DISCLAIMER } from '@/lib/constants'

// Onboarding — SPEC.md Flow 1.
// Step 0: disclaimer acknowledgement (must scroll + confirm)
// Steps 1–5: Financial DNA wizard (a conversation, not a form)
// Persistence: TODO(backend) — POST profile + acknowledgement on finish.

type DNA = Record<string, string>

interface Option {
  value: string
  label: string
}

interface Question {
  key: string
  prompt: string
  options: Option[]
}

interface StepDef {
  title: string
  intro: string
  questions: Question[]
}

const STEPS: StepDef[] = [
  {
    title: 'About you',
    intro: 'A few basics, so everything we show you fits your life.',
    questions: [
      {
        key: 'age_band',
        prompt: 'Your age',
        options: [
          { value: 'under_25', label: 'Under 25' },
          { value: '25_35', label: '25–35' },
          { value: '36_45', label: '36–45' },
          { value: '46_54', label: '46–54' },
          { value: '55_65', label: '55–65' },
          { value: 'above_65', label: 'Above 65' },
        ],
      },
      {
        key: 'family_role',
        prompt: 'In your family, you are…',
        options: [
          { value: 'self', label: 'Managing my own money' },
          { value: 'spouse', label: 'Managing for us as a couple' },
          { value: 'parent', label: 'A parent managing family money' },
          { value: 'child', label: 'Helping my parents with theirs' },
        ],
      },
    ],
  },
  {
    title: 'Your income',
    intro: 'This stays private — it helps us understand your capacity, never to judge.',
    questions: [
      {
        key: 'employment_type',
        prompt: 'How do you earn?',
        options: [
          { value: 'salaried_private', label: 'Salaried — private' },
          { value: 'salaried_govt', label: 'Salaried — government' },
          { value: 'business', label: 'Business' },
          { value: 'freelance', label: 'Freelance' },
          { value: 'retired', label: 'Retired' },
          { value: 'homemaker', label: 'Homemaker' },
          { value: 'student', label: 'Student' },
        ],
      },
      {
        key: 'income_range',
        prompt: 'Monthly income, roughly',
        options: [
          { value: 'under_25k', label: 'Under ₹25,000' },
          { value: '25k_50k', label: '₹25,000–₹50,000' },
          { value: '50k_1l', label: '₹50,000–₹1L' },
          { value: '1l_2.5l', label: '₹1L–₹2.5L' },
          { value: 'above_2.5l', label: 'Above ₹2.5L' },
        ],
      },
      {
        key: 'income_stability',
        prompt: 'How steady is it?',
        options: [
          { value: 'very_stable', label: 'Very steady' },
          { value: 'somewhat_variable', label: 'Varies a little' },
          { value: 'highly_variable', label: 'Varies a lot' },
        ],
      },
    ],
  },
  {
    title: 'Your life right now',
    intro: 'Money plans only make sense around the life they serve.',
    questions: [
      {
        key: 'marital_status',
        prompt: 'Family situation',
        options: [
          { value: 'single', label: 'Single' },
          { value: 'married', label: 'Married' },
          { value: 'widowed', label: 'Widowed' },
          { value: 'divorced', label: 'Divorced' },
        ],
      },
      {
        key: 'dependents',
        prompt: 'People who depend on your income',
        options: [
          { value: '0', label: 'Just me' },
          { value: '1', label: '1 person' },
          { value: '2', label: '2 people' },
          { value: '3_plus', label: '3 or more' },
        ],
      },
      {
        key: 'major_expense',
        prompt: 'Any big expense on the horizon?',
        options: [
          { value: 'none', label: 'Nothing major' },
          { value: 'education', label: 'Education' },
          { value: 'marriage', label: 'A wedding' },
          { value: 'home', label: 'A home' },
          { value: 'medical', label: 'Medical care' },
        ],
      },
    ],
  },
  {
    title: 'How you feel about risk',
    intro: 'There are no right answers here — only honest ones.',
    questions: [
      {
        key: 'covid_crash_behaviour',
        prompt: 'March 2020 — markets fell 35% in weeks. What did you do?',
        options: [
          { value: 'panic_sold', label: 'Sold — couldn’t watch it fall' },
          { value: 'stayed', label: 'Held on and waited' },
          { value: 'bought_more', label: 'Bought more' },
          { value: 'not_invested', label: 'Wasn’t investing yet' },
        ],
      },
      {
        key: 'can_afford_20pct_loss',
        prompt: 'If your investments dropped 20% for a year, would daily life continue unaffected?',
        options: [
          { value: 'yes', label: 'Yes, comfortably' },
          { value: 'no', label: 'No, it would hurt' },
          { value: 'unsure', label: 'Honestly not sure' },
        ],
      },
      {
        key: 'investment_horizon',
        prompt: 'When will you need most of this money?',
        options: [
          { value: '3', label: 'Within 3 years' },
          { value: '7', label: '3–7 years' },
          { value: '15', label: '7–15 years' },
          { value: '20', label: '15+ years' },
        ],
      },
    ],
  },
  {
    title: 'Taxes',
    intro: 'Last step — this helps us put numbers in the right context.',
    questions: [
      {
        key: 'tax_slab',
        prompt: 'Your income tax slab',
        options: [
          { value: 'nil', label: 'No tax' },
          { value: '5pct', label: '5%' },
          { value: '20pct', label: '20%' },
          { value: '30pct', label: '30%' },
        ],
      },
      {
        key: 'elss_done',
        prompt: 'Do you invest in ELSS (tax-saving funds)?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Not sure what that is' },
        ],
      },
      {
        key: 'section_80c_exhausted',
        prompt: 'Is your 80C limit (₹1.5L) already used up?',
        options: [
          { value: 'yes', label: 'Yes, fully' },
          { value: 'no', label: 'No, there’s room' },
          { value: 'unsure', label: 'Not sure' },
        ],
      },
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  // step -1 = disclaimer acknowledgement, 0..4 = DNA steps, 5 = done
  const [step, setStep] = useState(-1)
  const [dna, setDna] = useState<DNA>({})
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  function onDisclaimerScroll() {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToEnd(true)
    }
  }

  function finish() {
    // TODO(backend): persist DNA profile + legal acknowledgement,
    // then continue to portfolio entry. Preview goes to dashboard.
    router.push('/dashboard')
  }

  if (step === -1) {
    return (
      <main className="flex min-h-screen flex-col bg-amber-50 px-6 py-10">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          <h1 className="text-xl font-medium text-gray-900">
            Before we begin
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Please read this fully. It matters.
          </p>
          <div
            ref={scrollRef}
            onScroll={onDisclaimerScroll}
            className="card mt-5 max-h-72 space-y-3 overflow-y-auto text-sm text-gray-600"
          >
            <p>{STANDARD_DISCLAIMER}</p>
            <p>
              {PLATFORM_NAME} will show you information, context and
              simulations. It will never tell you to buy, sell or switch
              anything. Every financial decision you make is yours alone.
            </p>
            <p>
              Simulations use stated assumptions that are not guaranteed.
              Mutual fund investments are subject to market risks. Read all
              scheme related documents carefully.
            </p>
            <p>
              Your data is protected by row level security and is never sold
              or shared for marketing. You can delete everything, permanently,
              at any time.
            </p>
            <p className="text-gray-400">— End of disclaimer —</p>
          </div>
          <button
            className="btn-primary mt-6"
            disabled={!scrolledToEnd}
            onClick={() => setStep(0)}
          >
            {scrolledToEnd
              ? 'I understand — information, not advice'
              : 'Please scroll to the end to continue'}
          </button>
        </div>
      </main>
    )
  }

  if (step >= STEPS.length) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-6 text-center">
        <span className="text-5xl" role="img" aria-label="Sunrise">
          🌅
        </span>
        <h1 className="mt-4 text-xl font-medium text-gray-900">
          That’s everything we need
        </h1>
        <p className="mt-2 max-w-sm text-gray-600">
          Next, add your investments and loans at your own pace — your
          dashboard will fill in as you go.
        </p>
        <div className="mt-8 w-full max-w-sm">
          <button className="btn-primary" onClick={finish}>
            See my dashboard
          </button>
        </div>
      </main>
    )
  }

  const current = STEPS[step]
  const answered = current.questions.every((q) => dna[q.key])

  return (
    <main className="flex min-h-screen flex-col bg-amber-50 px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <p className="text-xs text-gray-400">
          Step {step + 1} of {STEPS.length}
        </p>
        <div className="mt-2 flex gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? 'bg-amber-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h1 className="mt-6 text-xl font-medium text-gray-900">
          {current.title}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{current.intro}</p>

        <div className="mt-6 space-y-6">
          {current.questions.map((q) => (
            <fieldset key={q.key}>
              <legend className="label">{q.prompt}</legend>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const selected = dna[q.key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setDna({ ...dna, [q.key]: opt.value })
                      }
                      className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-amber-800 bg-amber-800 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-amber-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-auto flex gap-3 pt-8">
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button
            className="btn-primary"
            disabled={!answered}
            onClick={() => setStep(step + 1)}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  )
}
