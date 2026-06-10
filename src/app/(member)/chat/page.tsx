'use client'

import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { STANDARD_DISCLAIMER } from '@/lib/constants'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME: Message = {
  role: 'assistant',
  content:
    'Hello! I’m here whenever you want to talk through your money — what you own, what the news means for you, or what a decision might look like before you make it. What’s on your mind?',
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setBusy(true)
    try {
      // TODO(backend): POST /api/chat — Claude with Financial DNA injection.
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('not wired')
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'The chat brain isn’t connected yet — it arrives with the backend. Soon I’ll be able to answer with your full portfolio in mind.',
        },
      ])
    } finally {
      setBusy(false)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <TopBar title="Chat" showBack />
      <main className="mx-auto flex max-w-lg flex-col px-4 py-5">
        <div className="flex-1 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
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

        <div className="sticky bottom-20 mt-3 flex gap-2 bg-amber-50 pb-1 pt-2">
          <input
            className="input flex-1"
            placeholder="Ask anything about your money…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            aria-label="Message"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
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
