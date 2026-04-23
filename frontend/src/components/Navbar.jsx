import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme.js'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-brand-500">
        <span aria-hidden>📚</span>
        <span>AI Study Companion</span>
      </Link>

      <nav className="flex items-center gap-3 text-sm">
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="btn-ghost"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user ? (
          <>
            <span className="hidden text-slate-600 sm:inline dark:text-slate-300">
              Hi, {user.username}
            </span>
            <button onClick={handleLogout} className="btn-ghost">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-700 hover:text-brand-500 dark:text-slate-300">
              Login
            </Link>
            <Link to="/register" className="btn-primary">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  )
}
