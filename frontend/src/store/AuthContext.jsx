import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken, ApiClient } from './apiClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Initialize token from localStorage immediately
    return localStorage.getItem('auth_token')
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage and verify with backend
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token')
        
        if (savedToken) {
          setAuthToken(savedToken)
          setToken(savedToken)
          
          // Verify token with backend
          try {
            const response = await ApiClient.get('/api/auth/me')
            console.log('Auth verification response:', response) // Debug log
            
            if (response?.success && response?.data?.user) {
              setUser(response.data.user)
              console.log('User authenticated:', response.data.user.email) // Debug log
            } else {
              // Invalid response format, clear token
              console.log('Invalid auth response format:', response)
              clearAuthData()
            }
          } catch (error) {
            // Token is invalid or expired
            console.log('Token verification failed:', error.message)
            clearAuthData()
          }
        } else {
          console.log('No saved token found')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearAuthData()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Clear authentication data
  const clearAuthData = useCallback(() => {
    console.log('Clearing auth data') // Debug log
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem('auth_token')
    setError(null)
  }, [])

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await ApiClient.post('/api/auth/login', credentials)
      console.log('Login response:', response) // Debug log
      
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data
        
        // Update state
        setToken(newToken)
        setUser(userData)
        setAuthToken(newToken)
        localStorage.setItem('auth_token', newToken)
        
        console.log('Login successful, token stored:', newToken?.substring(0, 20) + '...') // Debug log
        
        return { success: true, user: userData, token: newToken }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      const errorMessage = error.data?.message || error.message || 'Login failed'
      const errors = error.data?.errors || null
      
      console.error('Login error:', errorMessage) // Debug log
      
      setError({ message: errorMessage, errors })
      clearAuthData()
      
      throw { 
        message: errorMessage, 
        errors,
        status: error.status 
      }
    } finally {
      setLoading(false)
    }
  }, [clearAuthData])

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await ApiClient.post('/api/auth/register', userData)
      
      if (response.success && response.data) {
        const { token: newToken, user: userInfo } = response.data
        
        // Update state
        setToken(newToken)
        setUser(userInfo)
        setAuthToken(newToken)
        localStorage.setItem('auth_token', newToken)
        
        return { success: true, user: userInfo, token: newToken }
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error.data?.message || error.message || 'Registration failed'
      const errors = error.data?.errors || null
      
      setError({ message: errorMessage, errors })
      clearAuthData()
      
      throw { 
        message: errorMessage, 
        errors,
        status: error.status 
      }
    } finally {
      setLoading(false)
    }
  }, [clearAuthData])

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint
      await ApiClient.post('/api/auth/logout')
    } catch (error) {
      // Even if backend call fails, clear local auth data
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
    }
  }, [clearAuthData])

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await ApiClient.put('/api/auth/updatedetails', profileData)
      
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        return { success: true, user: response.data.user }
      } else {
        throw new Error(response.message || 'Update failed')
      }
    } catch (error) {
      const errorMessage = error.data?.message || error.message || 'Update failed'
      const errors = error.data?.errors || null
      
      setError({ message: errorMessage, errors })
      
      throw { 
        message: errorMessage, 
        errors,
        status: error.status 
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Update password
  const updatePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await ApiClient.put('/api/auth/updatepassword', passwordData)
      
      if (response.success) {
        // Password updated successfully, token might be refreshed
        if (response.data?.token) {
          const newToken = response.data.token
          setToken(newToken)
          setAuthToken(newToken)
          localStorage.setItem('auth_token', newToken)
        }
        
        return { success: true }
      } else {
        throw new Error(response.message || 'Password update failed')
      }
    } catch (error) {
      const errorMessage = error.data?.message || error.message || 'Password update failed'
      const errors = error.data?.errors || null
      
      setError({ message: errorMessage, errors })
      
      throw { 
        message: errorMessage, 
        errors,
        status: error.status 
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return !!(token && user)
  }, [token, user])

  const value = useMemo(() => ({
    // State
    token,
    user,
    loading,
    error,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    clearError
  }), [
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    clearError
  ])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}