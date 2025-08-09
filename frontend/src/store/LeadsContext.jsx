import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiClient } from './apiClient.js'

const LeadsContext = createContext(null)

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.get('/leads')
      if (Array.isArray(data)) setLeads(data)
      else setLeads(data?.items || [])
    } catch (err) {
      setError(err)
      // local fallback sample when backend not ready
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createLead = useCallback(async (payload) => {
    const res = await ApiClient.post('/leads', payload)
    setLeads((prev) => [res, ...prev])
    return res
  }, [])

  const value = useMemo(() => ({ leads, setLeads, loading, error, loadLeads, createLead }), [leads, loading, error, loadLeads, createLead])

  useEffect(() => { loadLeads() }, [loadLeads])

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  )
}

export function useLeads() {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider')
  return ctx
}