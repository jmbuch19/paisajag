import type { Config } from 'tailwindcss'

// Design tokens from DESIGN.md — never invent new colours.
// amber-600 (#C97B2A) is decorative only: never text on light backgrounds,
// never white text on it. Text/CTAs use amber-800 (#854F0B).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      amber: {
        50: '#FFFBF5',
        100: '#FEF3E2',
        200: '#FAEEDA',
        400: '#FAC775',
        600: '#C97B2A',
        800: '#854F0B',
        900: '#633806',
      },
      teal: {
        50: '#E1F5EE',
        400: '#1D9E75',
        600: '#0F6E56',
        800: '#085041',
      },
      red: {
        50: '#FCEBEB',
        400: '#E24B4A',
        600: '#A32D2D',
      },
      blue: {
        50: '#E6F1FB',
        400: '#378ADD',
        600: '#185FA5',
      },
      gray: {
        50: '#FAFAF8',
        100: '#F4F3EF',
        200: '#E8E7E1',
        400: '#9E9D96',
        600: '#5F5E5A',
        900: '#1E1E1C',
      },
      positive: '#3B6D11',
      negative: '#A32D2D',
      neutral: '#5F5E5A',
      warning: '#854F0B',
      brand: '#C97B2A',
    },
    fontFamily: {
      sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      serif: ['var(--font-noto-devanagari)', 'var(--font-lora)', 'Georgia', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
    },
    fontSize: {
      xs: ['11px', { lineHeight: '1.5' }],
      sm: ['13px', { lineHeight: '1.6' }],
      base: ['15px', { lineHeight: '1.7' }],
      lg: ['18px', { lineHeight: '1.4' }],
      xl: ['22px', { lineHeight: '1.3' }],
      '2xl': ['28px', { lineHeight: '1.2' }],
      '3xl': ['36px', { lineHeight: '1.1' }],
    },
    fontWeight: {
      // Never 600 or 700 — too heavy (DESIGN.md)
      normal: '400',
      medium: '500',
    },
    borderRadius: {
      none: '0',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    extend: {
      spacing: {
        '18': '72px',
      },
    },
  },
  plugins: [],
}

export default config
