import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ApiClient } from './apiClient.js'

const ScriptsContext = createContext(null)

export function ScriptsProvider({ children }) {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedScriptId, setSelectedScriptId] = useState(() => {
    try {
      if (typeof window === 'undefined') return null
      return window.localStorage.getItem('selectedScriptId') || null
    } catch {
      return null
    }
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await ApiClient.get('/api/scripts')
      const list = res?.data || res || []
      setScripts(list)
      // Keep a valid current selection if it still exists; otherwise use saved; otherwise clear
      const saved = (typeof window !== 'undefined') ? window.localStorage.getItem('selectedScriptId') : null
      setSelectedScriptId(prev => {
        const prevIsValid = prev && list.some(s => s._id === prev)
        const savedIsValid = saved && list.some(s => s._id === saved)
        if (prevIsValid) return prev
        if (savedIsValid) return saved
        return null
      })
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async (payload) => {
    const res = await ApiClient.post('/api/scripts', payload)
    const s = res?.data || res
    setScripts(prev => [s, ...prev])
    return s
  }

  const update = async (id, payload) => {
    const res = await ApiClient.put(`/api/scripts/${id}`, payload)
    const s = res?.data || res
    setScripts(prev => prev.map(p => p._id === s._id ? s : p))
    return s
  }

  const remove = async (id) => {
    await ApiClient.delete(`/api/scripts/${id}`)
    setScripts(prev => prev.filter(p => p._id !== id))
    if (selectedScriptId === id) setSelectedScriptId(null)
  }

  const duplicate = async (id) => {
    const res = await ApiClient.post(`/api/scripts/${id}/duplicate`)
    const s = res?.data || res
    setScripts(prev => [s, ...prev])
    return s
  }

  const value = useMemo(() => ({
    scripts, loading, error,
    reload: load,
    create, update, remove, duplicate,
    selectedScriptId, setSelectedScriptId,
  }), [scripts, loading, error, selectedScriptId])

  // persist selection
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedScriptId) window.localStorage.setItem('selectedScriptId', selectedScriptId)
    else window.localStorage.removeItem('selectedScriptId')
  }, [selectedScriptId])

  return <ScriptsContext.Provider value={value}>{children}</ScriptsContext.Provider>
}

export const useScripts = () => useContext(ScriptsContext)
