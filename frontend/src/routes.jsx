import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Chat from './pages/Chat.jsx'
import Notes from './pages/Notes.jsx'
import Flashcards from './pages/Flashcards.jsx'
import Planner from './pages/Planner.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Landing from './pages/Landing.jsx'
import { useAuth } from './hooks/useAuth.js'

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/welcome" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/welcome" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/chat" element={<Private><Chat /></Private>} />
      <Route path="/notes" element={<Private><Notes /></Private>} />
      <Route path="/flashcards" element={<Private><Flashcards /></Private>} />
      <Route path="/planner" element={<Private><Planner /></Private>} />
      <Route path="/profile" element={<Private><Profile /></Private>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
