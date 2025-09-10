import { useState, useEffect } from 'react'
import { ApiClient } from './apiClient.js'

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeLeads: 0,
    successRate: 0,
    activeCampaigns: 0,
    recentCalls: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch calls data
        const callsResponse = await ApiClient.get('/api/calls')
        const callsData = Array.isArray(callsResponse) ? callsResponse : (callsResponse?.data || [])
        
        // Fetch contacts/leads data
        const contactsResponse = await ApiClient.get('/api/contacts')
        const contactsData = Array.isArray(contactsResponse) ? contactsResponse : (contactsResponse?.data || [])
        
        // Calculate stats
        const totalCalls = callsData.length
        const activeLeads = contactsData.filter(c => c.status !== 'Lost').length
        const successfulCalls = callsData.filter(c => 
          c.status === 'completed' || c.status === 'successful'
        ).length
        const successRate = totalCalls > 0 ? ((successfulCalls / totalCalls) * 100) : 0
        
        // Get recent calls (last 5)
        const recentCalls = callsData
          .sort((a, b) => new Date(b.createdAt || b.updatedAt || Date.now()) - new Date(a.createdAt || a.updatedAt || Date.now()))
          .slice(0, 5)
          .map(call => ({
            id: call._id || call.id,
            contact: call.contact?.name || call.name || 'Unknown',
            phone: call.phoneNumber || call.phone,
            status: call.status || 'unknown',
            duration: call.duration || 0,
            createdAt: call.createdAt || call.updatedAt || new Date().toISOString()
          }))

        // Generate recent activity
        const recentActivity = [
          ...contactsData.slice(0, 2).map(contact => ({
            type: 'lead_added',
            message: `New lead added: ${contact.name}`,
            time: contact.createdAt || contact.updatedAt || new Date().toISOString(),
            tag: 'info'
          })),
          ...callsData.slice(0, 3).map(call => ({
            type: 'call_completed',
            message: `Call ${call.status || 'completed'} - ${call.contact?.name || call.name || call.phoneNumber || call.phone || 'Unknown'}`,
            time: call.createdAt || call.updatedAt || new Date().toISOString(),
            tag: call.status === 'completed' ? 'success' : 'info'
          }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5)

        setStats({
          totalCalls,
          activeLeads,
          successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
          activeCampaigns: 0, // TODO: Add campaigns tracking
          recentCalls,
          recentActivity
        })
        
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError(err?.message || 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
