import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const LeadsContext = createContext(null)

const DUMMY = Array.from({ length: 24 }).map((_, i) => ({
  id: `DL${100 + i}`,
  name: ['Ava Smith', 'Liam Johnson', 'Olivia Brown', 'Noah Davis'][i % 4],
  email: `dummy${i}@example.com`,
  phone: `+1 (555) 100-${String(1000 + i).slice(1)}`,
  status: ['New', 'Contacted', 'Qualified', 'Lost'][i % 4],
  score: [72, 35, 88, 55][i % 4],
  createdAt: `2025-07-${(i % 28) + 1}`,
}))

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 200))
      setLeads(DUMMY)
    } catch (err) {
      setError(err)
      setLeads(DUMMY)
    } finally {
      setLoading(false)
    }
  }, [])

  const createLead = useCallback(async (payload) => {
    await new Promise((r) => setTimeout(r, 200))
    const newLead = { id: `DL${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString().slice(0,10), status: 'New', score: 0, ...payload }
    setLeads((prev) => [newLead, ...prev])
    return newLead
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