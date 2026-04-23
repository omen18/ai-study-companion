import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'
import { notesApi } from '../services/api.js'
import { formatDate } from '../utils/formatDate.js'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', content: '', subject: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [query, setQuery] = useState('')
  const [summarizingId, setSummarizingId] = useState(null)
  const [summary, setSummary] = useState(null)

  const refresh = (q = query) => notesApi.list(q).then(setNotes)

  useEffect(() => {
    refresh('').finally(() => setLoading(false))
  }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => refresh(query), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await notesApi.create(form)
      setForm({ title: '', content: '', subject: '' })
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await notesApi.upload(file)
      await refresh()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this note?')) return
    await notesApi.remove(id)
    await refresh()
  }

  const summarize = async (note) => {
    setSummarizingId(note.id)
    setSummary(null)
    try {
      const { summary: text } = await notesApi.summarize(note.id)
      setSummary({ id: note.id, title: note.title, text })
    } finally {
      setSummarizingId(null)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <Card title="New note">
          <form onSubmit={save} className="space-y-3">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
            />
            <input
              placeholder="Subject (optional)"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="input"
            />
            <textarea
              placeholder="Content"
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input"
            />
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Save note'}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <label className="block text-sm font-medium">Upload PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={onUpload}
              disabled={uploading}
              className="mt-2 block w-full text-sm"
            />
            {uploading && <p className="mt-1 text-xs text-slate-500">Extracting…</p>}
          </div>
        </Card>

        {summary && (
          <Card title={`AI summary — ${summary.title}`}
                action={<button className="btn-ghost" onClick={() => setSummary(null)}>Close</button>}>
            <pre className="whitespace-pre-wrap text-sm">{summary.text}</pre>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        <input
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
        />

        {notes.length === 0 && (
          <p className="text-sm text-slate-500">No notes found.</p>
        )}

        {notes.map((n) => (
          <Card
            key={n.id}
            title={n.title}
            action={
              <div className="flex gap-2">
                <button
                  onClick={() => summarize(n)}
                  disabled={summarizingId === n.id}
                  className="btn-ghost"
                >
                  {summarizingId === n.id ? 'Summarizing…' : '✨ Summarize'}
                </button>
                <button onClick={() => remove(n.id)} className="text-xs text-rose-600 hover:underline">
                  Delete
                </button>
              </div>
            }
          >
            {n.subject && (
              <span className="inline-block rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                {n.subject}
              </span>
            )}
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {n.content || <em className="text-slate-400">empty</em>}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Updated {formatDate(n.updated_at, { withTime: true })}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
