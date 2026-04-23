import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

const features = [
  { icon: '💬', title: 'Chat with your notes',       body: 'Ground AI answers in the material you actually study.' },
  { icon: '🎴', title: 'AI-generated flashcards',    body: 'Turn any note into a deck of conceptual Q&As in seconds.' },
  { icon: '📝', title: 'PDF → study guide',          body: 'Upload a PDF and get an instant structured summary.' },
  { icon: '🔥', title: 'Streaks & progress',         body: 'Stay consistent with daily streaks and topic tracking.' },
  { icon: '🌙', title: 'Dark mode',                  body: 'Built for late-night cram sessions.' },
  { icon: '⚡', title: 'Streaming responses',         body: 'No more waiting — answers appear as they are written.' },
]

export default function Landing() {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-5xl space-y-16 py-10">
      <section className="text-center">
        <p className="mb-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
          AI-powered · Open source · Self-hostable
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Study smarter,{' '}
          <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
            not longer.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Your personal AI study companion. Chat with your notes, generate
          flashcards, track progress, and keep your streak alive.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">Get started — free</Link>
          <Link to="/login" className="btn-ghost px-6 py-3 text-base">I already have an account</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="card">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-2 text-base font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-xs text-slate-400">
        Open source · MIT licensed · Built with FastAPI + React
      </footer>
    </div>
  )
}
