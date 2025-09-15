import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useScripts } from './ScriptsContext.jsx'
import { ApiClient } from './apiClient.js'

const CampaignsContext = createContext(null)

export function CampaignsProvider({ children }) {
  const [campaigns, setCampaigns] = useState([])
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { selectedScriptId } = useScripts?.() || { selectedScriptId: null }

  const loadCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiClient.get('/api/campaigns')
      const data = Array.isArray(response) ? response : (response?.data || [])
      
      const transformedCampaigns = data.map(campaign => ({
        id: campaign._id || campaign.id,
        name: campaign.name || '',
        status: campaign.status || 'Draft',
        contactsCount: campaign.contactsCount || 0,
        completedCalls: campaign.completedCalls || 0,
        successRate: campaign.successRate || 0,
        createdAt: campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        description: campaign.description || '',
        contacts: campaign.contacts || []
      }))
      setCampaigns(transformedCampaigns)
    } catch (err) {
      console.error('Error loading campaigns:', err)
      setError(err?.message || 'Failed to load campaigns')
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCalls = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiClient.get('/api/calls')
      const data = Array.isArray(response) ? response : (response?.data || [])
      
      const transformedCalls = data.map(call => ({
        id: call._id || call.id,
        contactName: call.contact?.name || call.contactName || 'Unknown',
        phoneNumber: call.phoneNumber || call.phone || '',
        status: call.status || 'pending',
        duration: call.duration || 0,
        transcript: call.transcript || '',
        createdAt: call.createdAt ? new Date(call.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        vapiCallId: call.vapiCallId || '',
        campaign: call.campaign || null
      }))
      setCalls(transformedCalls)
    } catch (err) {
      console.error('Error loading calls:', err)
      setError(err?.message || 'Failed to load calls')
      setCalls([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createCampaign = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.post('/api/campaigns', payload)
      const newCampaign = {
        id: data._id,
        name: data.name,
        status: data.status || 'Draft',
        contactsCount: data.contactsCount || 0,
        completedCalls: data.completedCalls || 0,
        successRate: data.successRate || 0,
        createdAt: new Date(data.createdAt).toLocaleDateString(),
        description: data.description || '',
        contacts: data.contacts || []
      }
      setCampaigns(prev => [newCampaign, ...prev])
      return newCampaign
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err?.message || 'Failed to create campaign')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const startCampaign = useCallback(async (id, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const body = {
        ...options,
        scriptId: options.scriptId ?? selectedScriptId ?? undefined,
      }
      const res = await ApiClient.post(`/api/campaigns/${id}/start`, body)
      return res
    } catch (err) {
      console.error('Error starting campaign:', err)
      setError(err?.message || 'Failed to start campaign')
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedScriptId])

  const createCall = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiClient.post('/api/calls', {
        ...payload,
        scriptId: payload.scriptId ?? selectedScriptId ?? undefined,
      })
      const newCall = {
        id: data._id,
        contactName: data.contact?.name || data.contactName || 'Unknown',
        phoneNumber: data.phoneNumber || data.phone || '',
        status: data.status || 'pending',
        duration: data.duration || 0,
        transcript: data.transcript || '',
        createdAt: new Date(data.createdAt).toLocaleDateString(),
        vapiCallId: data.vapiCallId || '',
        campaign: data.campaign || null
      }
      setCalls(prev => [newCall, ...prev])
      return newCall
    } catch (err) {
      console.error('Error creating call:', err)
      setError(err?.message || 'Failed to create call')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCampaign = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await ApiClient.delete(`/api/campaigns/${id}`)
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
    } catch (err) {
      console.error('Error deleting campaign:', err)
      setError(err?.message || 'Failed to delete campaign')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(() => ({ 
    campaigns, 
    calls,
    loading, 
    error, 
    loadCampaigns,
    loadCalls,
    createCampaign,
    createCall,
    startCampaign,
    deleteCampaign
  }), [campaigns, calls, loading, error, loadCampaigns, loadCalls, createCampaign, createCall, startCampaign, deleteCampaign])

  useEffect(() => { 
    loadCampaigns()
    loadCalls()
  }, [loadCampaigns, loadCalls])

  return (
    <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>
  )
}

export function useCampaigns() {
  const ctx = useContext(CampaignsContext)
  if (!ctx) throw new Error('useCampaigns must be used within CampaignsProvider')
  return ctx
}
