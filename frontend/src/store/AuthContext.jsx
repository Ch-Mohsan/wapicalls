import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from './apiClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('auth_token')
    if (saved) {
      setToken(saved)
      setAuthToken(saved)
      setUser((prev) => prev ?? { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' })
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    // Mock auth: pretend to call API, then set token and user
    await new Promise((r) => setTimeout(r, 300))
    const newToken = 'demo_token'
    setToken(newToken)
    setAuthToken(newToken)
    localStorage.setItem('auth_token', newToken)
    const demoUser = { id: 'demo-user', email: credentials?.email ?? 'demo@example.com', name: 'Demo User' }
    setUser(demoUser)
    return { token: newToken, user: demoUser }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem('auth_token')
  }, [])

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading, login, logout])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}