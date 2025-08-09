import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken, ApiClient } from './apiClient.js'

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
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await ApiClient.post('/auth/login', credentials)
    const newToken = res?.token
    if (newToken) {
      setToken(newToken)
      setAuthToken(newToken)
      localStorage.setItem('auth_token', newToken)
    }
    setUser(res?.user || null)
    return res
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