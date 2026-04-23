import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'
import { progressApi } from '../services/api.js'

export default function Planner() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ topic: '', completion: 0, score: 0 })

  const refresh = () => progressApi.list().then(setRows)

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    if (!form.topic.trim()) return
    await progressApi.upsert({
      topic: form.topic,
      completion: Number(form.completion),
      score: Number(form.score),
    })
    setForm({ topic: '', completion: 0, score: 0 })
    await refresh()
  }

  const remove = async (id) => {
    await progressApi.remove(id)
    await refresh()
  }

  if (loading) return <Loader />

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[380px_1fr]">
      <Card title="Add / update topic">
        <form onSubmit={save} className="space-y-3">
          <input
            placeholder="Topic (e.g. Linear Algebra)"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="input"
          />
          <label className="block text-xs text-slate-500">
            Completion ({Math.round(form.completion * 100)}%)
            <input
              type="range" min={0} max={1} step={0.05}
              value={form.completion}
              onChange={(e) => setForm({ ...form, completion: e.target.value })}
              className="mt-1 w-full"
            />
          </label>
          <label className="block text-xs text-slate-500">
            Latest score (0–100)
            <input
              type="number" min={0} max={100} step={1}
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              className="input mt-1"
            />
          </label>
          <button type="submit" className="btn-primary w-full">Save</button>
        </form>
      </Card>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-slate-500">
            No topics yet — add one on the left to start tracking your progress.
          </p>
        )}
        {rows.map((r) => (
          <Card
            key={r.id}
            title={r.topic}
            action={
              <button onClick={() => remove(r.id)} className="text-xs text-rose-600 hover:underline">
                Remove
              </button>
            }
          >
            <div className="mt-1 h-2 w-full rounded bg-slate-100 dark:bg-slate-800">
              <div
                className="h-2 rounded bg-brand-500"
                style={{ width: `${Math.round(r.completion * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {Math.round(r.completion * 100)}% complete · Score {r.score}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
