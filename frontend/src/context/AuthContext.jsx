import { createContext, useEffect, useState } from 'react'
import { authApi } from '../services/api.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aisc_user')
      if (raw) setUser(JSON.parse(raw))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [])

  const persist = (token, userObj) => {
    localStorage.setItem('aisc_token', token)
    localStorage.setItem('aisc_user', JSON.stringify(userObj))
    setUser(userObj)
  }

  const login = async (email, password) => {
    const { access_token, user: u } = await authApi.login(email, password)
    persist(access_token, u)
    return u
  }

  const register = async (payload) => {
    const { access_token, user: u } = await authApi.register(payload)
    persist(access_token, u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('aisc_token')
    localStorage.removeItem('aisc_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
