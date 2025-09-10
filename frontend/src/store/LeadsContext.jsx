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
      const response = await ApiClient.get('/api/contacts')
      const data = Array.isArray(response) ? response : (response?.data || [])
      
      // Transform contacts to leads format
      const transformedLeads = data.map(contact => ({
        id: contact._id || contact.id,
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phoneNumber || contact.phone || '', // Backend uses phoneNumber
        status: contact.status || 'New',
        score: contact.score || 0,
        createdAt: contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        company: contact.company || '',
        notes: contact.notes || ''
      }))
      setLeads(transformedLeads)
    } catch (err) {
      console.error('Error loading leads:', err)
      setError(err?.message || 'Failed to load leads')
      setLeads([]) // Clear leads on error
    } finally {
      setLoading(false)
    }
  }, [])

  const createLead = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.post('/api/contacts', payload)
      const newLead = {
        id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phoneNumber || data.phone, // Backend uses phoneNumber
        status: data.status || 'New',
        score: data.score || 0,
        createdAt: new Date(data.createdAt).toLocaleDateString(),
        company: data.company,
        notes: data.notes
      }
      setLeads(prev => [newLead, ...prev])
      return newLead
    } catch (err) {
      console.error('Error creating lead:', err)
      setError(err?.message || 'Failed to create lead')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateLead = useCallback(async (id, payload) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.put(`/api/contacts/${id}`, payload)
      const updatedLead = {
        id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phoneNumber || data.phone, // Backend uses phoneNumber
        status: data.status || 'New',
        score: data.score || 0,
        createdAt: new Date(data.createdAt).toLocaleDateString(),
        company: data.company,
        notes: data.notes
      }
      setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead))
      return updatedLead
    } catch (err) {
      console.error('Error updating lead:', err)
      setError(err?.message || 'Failed to update lead')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteLead = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await ApiClient.delete(`/api/contacts/${id}`)
      setLeads(prev => prev.filter(lead => lead.id !== id))
    } catch (err) {
      console.error('Error deleting lead:', err)
      setError(err?.message || 'Failed to delete lead')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkImportLeads = useCallback(async (csvData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.post('/api/contacts/bulk-import', { contacts: csvData })
      await loadLeads() // Refresh the leads list
      return data
    } catch (err) {
      console.error('Error importing leads:', err)
      setError(err?.message || 'Failed to import leads')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadLeads])

  const value = useMemo(() => ({ 
    leads, 
    setLeads, 
    loading, 
    error, 
    loadLeads, 
    createLead, 
    updateLead, 
    deleteLead, 
    bulkImportLeads 
  }), [leads, loading, error, loadLeads, createLead, updateLead, deleteLead, bulkImportLeads])

  useEffect(() => { 
    loadLeads() 
  }, [loadLeads])

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  )
}

export function useLeads() {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider')
  return ctx
}