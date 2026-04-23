import { useLocation } from 'react-router-dom'
import AppRoutes from './routes.jsx'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import { useAuth } from './hooks/useAuth.js'

const PUBLIC_PATHS = new Set(['/welcome', '/login', '/register'])

export default function App() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const showSidebar = user && !PUBLIC_PATHS.has(pathname)

  return (
    <div className="flex h-full flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto p-6">
          <AppRoutes />
        </main>
      </div>
    </div>
  )
}
