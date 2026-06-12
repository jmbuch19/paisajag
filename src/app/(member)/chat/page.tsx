'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { STANDARD_DISCLAIMER } from '@/lib/constants'
import { getSupabaseBrowser } from '@/lib/supabase/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const DAILY_LIMIT = 5

const WELCOME: Message = {
  role: 'assistant',
  content:
    'Hello! I’m here whenever you want to talk through your money — what you own, what the news means for you, or what a decision might look like before you make it. What’s on your mind?',
}

// Start of the current IST day, as a UTC instant (mirrors the API route).
function istDayStartUtc(): Date {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
  const nowIst = new Date(Date.now() + IST_OFFSET_MS)
  return new Date(
    Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()) -
      IST_OFFSET_MS,
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [remaining, setRemaining] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Resume today's thread on open.
  useEffect(() => {
    const supabase = getSupabaseBrowser()
    if (!supabase) return
    supabase
      .from('chat_sessions')
      .select('messages')
      .gte('created_at', istDayStartUtc().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const history = (data?.messages ?? []) as Message[]
        if (history.length > 0) {
          setMessages([WELCOME, ...history.map((m) => ({ role: m.role, content: m.content }))])
        }
        setRemaining(DAILY_LIMIT - history.filter((m) => m.role === 'user').length)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'request failed')
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
      if (typeof data.remaining === 'number') setRemaining(data.remaining)
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'Something went wrong on our end — please try that again in a moment.',
        },
      ])
    } finally {
      setBusy(false)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const exhausted = remaining !== null && remaining <= 0

  return (
    <>
      <TopBar title="Chat" showBack />
      <main className="mx-auto flex max-w-lg flex-col px-4 py-5">
        <div className="flex-1 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-line rounded-lg px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'ml-auto bg-amber-800 text-white'
                  : 'card text-gray-900'
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="card max-w-[85%] px-4 py-3 text-sm text-gray-400">
              Thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <p className="disclaimer">{STANDARD_DISCLAIMER}</p>

        {remaining !== null && (
          <p className="mt-1 text-center text-xs text-gray-400">
            {exhausted
              ? 'We’ll pick this up tomorrow — same thread, fresh day.'
              : `${remaining} of ${DAILY_LIMIT} questions left today`}
          </p>
        )}

        <div className="sticky bottom-20 mt-3 flex gap-2 bg-amber-50 pb-1 pt-2">
          <input
            className="input flex-1"
            placeholder={
              exhausted
                ? 'Back tomorrow at sunrise…'
                : 'Ask anything about your money…'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            disabled={exhausted}
            aria-label="Message"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim() || exhausted}
            aria-label="Send message"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-amber-800 text-white disabled:opacity-50"
          >
            <Send size={18} aria-hidden />
          </button>
        </div>
      </main>
    </>
  )
}
