import Card from '../components/Card.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { formatDate } from '../utils/formatDate.js'

export default function Profile() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Your profile</h1>
      <Card>
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
          <dt className="text-slate-500">Username</dt>
          <dd>{user.username}</dd>
          <dt className="text-slate-500">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-slate-500">Member since</dt>
          <dd>{formatDate(user.created_at)}</dd>
        </dl>
      </Card>

      <button
        onClick={logout}
        className="rounded-md border border-rose-300 bg-white px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
      >
        Sign out
      </button>
    </div>
  )
}
