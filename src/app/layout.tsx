import type { Metadata, Viewport } from 'next'
import { Inter, Lora, Noto_Serif_Devanagari } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})

// Lora does not cover Devanagari — Noto Serif Devanagari is essential
// for the Kabir doha to render consistently across devices.
const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500'],
  variable: '--font-noto-devanagari',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PaisaJaag — Jag Paisa. Bhag Paisa.',
  description:
    'Wake up your money. PaisaJaag helps Indian families see, understand and simulate their investments — information, never advice.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PaisaJaag',
  },
}

export const viewport: Viewport = {
  themeColor: '#C97B2A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${lora.variable} ${notoDevanagari.variable}`}
      >
        {children}
      </body>
    </html>
  )
}
