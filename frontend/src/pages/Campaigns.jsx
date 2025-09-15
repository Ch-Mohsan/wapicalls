import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/Card.jsx'
import CampaignCard from '../components/CampaignCard.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useCampaigns } from '../store/CampaignsContext.jsx'
import { useToast } from '../store/ToastContext.jsx'
import CampaignDetailsModal from '../components/CampaignDetailsModal.jsx'
import { ApiClient } from '../store/apiClient.js'

function Campaigns() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const { campaigns, loading, error, loadCampaigns, deleteCampaign, startCampaign } = useCampaigns()
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error, showError])

  const filtered = useMemo(() => {
    return campaigns.filter((c) =>
      (!query || c.name.toLowerCase().includes(query.toLowerCase()) || c.id.toLowerCase().includes(query.toLowerCase())) &&
      (!status || c.status === status)
    )
  }, [campaigns, query, status])

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign(campaignId)
    }
  }

  const [startingId, setStartingId] = useState(null)
  const [detailsId, setDetailsId] = useState(null)
  const [liveStats, setLiveStats] = useState({}) // id -> buckets
  const handleStartCampaign = async (campaignId) => {
    if (startingId) return
    setStartingId(campaignId)
    try {
      const res = await startCampaign(campaignId)
      const count = res?.data?.data?.count || 0
      showSuccess(`Campaign started: queued ${count} call(s).`)
      // kick off first refresh
      fetchResults(campaignId)
    } catch (e) {
      const detail = e?.data?.error || e?.data || ''
      showError(`Failed to start campaign${detail ? `: ${typeof detail === 'string' ? detail : (detail.message || '')}` : ''}`)
    } finally {
      setStartingId(null)
    }
  }

  // Load results for a campaign to update live bucket counts
  const fetchResults = async (campaignId) => {
    try {
      const res = await ApiClient.get(`/api/campaigns/${campaignId}/results`)
      const d = res?.data?.data || {}
      setLiveStats(prev => ({ ...prev, [campaignId]: d.buckets || { initiated:0, ringing:0, inProgress:0, ended:0 } }))
    } catch {}
  }

  // Simple polling for running campaigns
  useEffect(() => {
    const running = campaigns.filter(c => c.status === 'Running')
    if (running.length === 0) return
    const interval = setInterval(() => {
      running.forEach(c => fetchResults(c.id))
    }, 5000)
    return () => clearInterval(interval)
  }, [campaigns])

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div 
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-primary">Campaigns</h1>
            <p className="text-sm text-slate-600">Track campaigns started from selected leads</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-slate-600">Search</label>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by name or ID" className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">Status</label>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40">
              <option value="">All</option>
              <option>Running</option>
              <option>Scheduled</option>
              <option>Paused</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
      </Card>
      </motion.div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-slate-600">Loading campaigns...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-slate-600">
            {campaigns.length === 0 ? 'No campaigns found. Create your first campaign!' : 'No campaigns match your filters.'}
          </div>
        </div>
      ) : (
        <motion.div 
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {filtered.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              <CampaignCard 
                campaign={{
                  id: c.id,
                  name: c.name,
                  status: c.status,
                  progress: c.progress || 0,
                  totalCalls: c.totalCalls || 0,
                  successRate: c.successRate || 0
                }}
                starting={startingId === c.id}
                buckets={liveStats[c.id]}
                onStart={() => handleStartCampaign(c.id)}
                onDetails={() => setDetailsId(c.id)}
                onDelete={() => handleDeleteCampaign(c.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      <CampaignDetailsModal open={!!detailsId} campaignId={detailsId} onClose={() => setDetailsId(null)} />
      </div>
    </PageTransition>
  )
}

export default Campaigns