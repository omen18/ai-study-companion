import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',           label: 'Dashboard',  icon: '📊' },
  { to: '/chat',       label: 'Chat',       icon: '💬' },
  { to: '/notes',      label: 'Notes',      icon: '📝' },
  { to: '/flashcards', label: 'Flashcards', icon: '🎴' },
  { to: '/planner',    label: 'Planner',    icon: '🎯' },
  { to: '/profile',    label: 'Profile',    icon: '👤' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <ul className="flex flex-col gap-1 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                  isActive
                    ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <span aria-hidden>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
