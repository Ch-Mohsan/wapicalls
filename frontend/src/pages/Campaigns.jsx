import React, { useMemo, useState, useEffect } from 'react'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { useCampaigns } from '../store/CampaignsContext.jsx'
import { useToast } from '../store/ToastContext.jsx'

function Campaigns() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const { campaigns, loading, error, loadCampaigns, deleteCampaign } = useCampaigns()
  const { showError } = useToast()

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Campaigns</h1>
          <p className="text-sm text-slate-600">Create and track campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/campaigns/new" className="rounded-md bg-secondary px-3 py-2 text-sm text-white hover:opacity-90">New Campaign</a>
        </div>
      </div>

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-primary">{c.name}</div>
                  <div className="text-xs text-slate-600">ID: {c.id}</div>
                </div>
                <Badge variant={c.status==='Running' ? 'success' : c.status==='Paused' ? 'warning' : c.status==='Completed' ? 'info' : 'default'}>{c.status}</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-primary font-medium">{c.progress || 0}%</span>
                </div>
                <ProgressBar value={c.progress || 0} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-semibold text-primary">{c.totalCalls || 0}</div>
                  <div className="text-xs text-slate-600">Calls</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-primary">{c.successRate || 0}%</div>
                  <div className="text-xs text-slate-600">Success</div>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <button className="rounded-md border border-accent/40 px-2 py-1 text-xs text-primary hover:bg-accent/20">Details</button>
                  <button 
                    onClick={() => handleDeleteCampaign(c.id)}
                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Campaigns