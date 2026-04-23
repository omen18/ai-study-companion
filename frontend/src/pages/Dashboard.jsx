import { useEffect, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'
import StreakCard from '../components/StreakCard.jsx'
import {
  activityApi, flashcardsApi, notesApi, progressApi,
} from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'

export default function Dashboard() {
  const { user } = useAuth()
  const [progress, setProgress] = useState([])
  const [notes, setNotes] = useState([])
  const [decks, setDecks] = useState([])
  const [recs, setRecs] = useState([])
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      progressApi.list(),
      notesApi.list(),
      flashcardsApi.list(),
      progressApi.recommendations(),
      activityApi.summary(),
      // log a tiny activity ping so the streak counts today
      activityApi.log({ minutes: 1, cards_reviewed: 0 }).catch(() => null),
    ])
      .then(([p, n, d, r, a]) => {
        setProgress(p); setNotes(n); setDecks(d); setRecs(r); setActivity(a)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const avgCompletion = progress.length
    ? Math.round((progress.reduce((a, p) => a + p.completion, 0) / progress.length) * 100)
    : 0

  const chartData = progress.map((p) => ({
    name: p.topic.length > 18 ? p.topic.slice(0, 18) + '…' : p.topic,
    completion: Math.round(p.completion * 100),
    score: Math.round(p.score || 0),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Welcome back, {user?.username} 👋</h1>
        <p className="text-sm text-slate-500">
          {activity?.current_streak > 0
            ? `🔥 ${activity.current_streak}-day streak — keep it up!`
            : 'Start studying today to begin your streak.'}
        </p>
      </div>

      <StreakCard summary={activity} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat title="Notes"         value={notes.length} />
        <MiniStat title="Decks"         value={decks.length} />
        <MiniStat title="Topics"        value={progress.length} />
        <MiniStat title="Avg completion" value={`${avgCompletion}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Progress by topic" className="lg:col-span-2">
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500">
              Add topics in the Planner to see your chart.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="completion" fill="#3a6bf0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="score"      fill="#d946ef" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Recommended next">
          {recs.length === 0 ? (
            <p className="text-sm text-slate-500">
              Add topics in the Planner to get recommendations.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recs.map((r) => (
                <li key={r} className="rounded-md bg-brand-50 px-3 py-2 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  🎯 {r}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function MiniStat({ title, value }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-brand-500">{value}</p>
    </div>
  )
}
