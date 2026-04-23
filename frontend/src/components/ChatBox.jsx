import { useRef, useState } from 'react'
import { chatApi } from '../services/api.js'
import Loader from './Loader.jsx'

export default function ChatBox({ noteId = null }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef(null)

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || streaming) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages([...next, { role: 'assistant', content: '' }])
    setInput('')
    setStreaming(true)

    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      await chatApi.stream(
        next,
        noteId,
        (delta) => {
          setMessages((prev) => {
            const copy = [...prev]
            const last = copy[copy.length - 1]
            copy[copy.length - 1] = { ...last, content: last.content + delta }
            return copy
          })
        },
        { signal: ctrl.signal },
      )
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `⚠️ ${err?.message ?? 'stream error'}` },
      ])
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const stop = () => abortRef.current?.abort()

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">
            Ask anything about your studies — the AI can even ground answers in your notes.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {m.content || (streaming && i === messages.length - 1 ? '…' : '')}
          </div>
        ))}
        {streaming && <Loader label="Thinking…" />}
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          className="input"
        />
        {streaming ? (
          <button type="button" onClick={stop} className="btn-ghost">Stop</button>
        ) : (
          <button type="submit" className="btn-primary">Send</button>
        )}
      </form>
    </div>
  )
}
