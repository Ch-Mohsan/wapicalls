import React, { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import Badge from './Badge.jsx'
import { ApiClient } from '../store/apiClient.js'

function StatusBadge({ status }) {
  const map = {
    initiated: 'default',
    queued: 'default',
    ringing: 'warning',
    'in-progress': 'info',
    completed: 'success',
    failed: 'danger',
    'no-answer': 'danger',
    busy: 'danger',
    canceled: 'default',
    cancelled: 'default',
  }
  const key = (status || '').toLowerCase()
  const variant = map[key] || 'default'
  return <Badge variant={variant}>{status}</Badge>
}

export default function CampaignDetailsModal({ campaignId, open, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({ total: 0, completed: 0, successRate: 0, buckets: { initiated:0, ringing:0, inProgress:0, ended:0 }, calls: [] })

  const load = async () => {
    if (!campaignId) return
    setLoading(true)
    setError(null)
    try {
      const res = await ApiClient.get(`/api/campaigns/${campaignId}/results`)
      const d = res?.data?.data || res?.data || res || {}
      setData({
        total: d.total || 0,
        completed: d.completed || 0,
        successRate: d.successRate || 0,
        buckets: d.buckets || { initiated:0, ringing:0, inProgress:0, ended:0 },
        calls: Array.isArray(d.calls) ? d.calls : []
      })
    } catch (e) {
      setError(e?.message || 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (open) load() }, [open, campaignId])

  return (
    <Modal isOpen={open} onClose={onClose} title="Campaign Details" maxWidth="max-w-3xl">
      {loading ? (
        <div className="py-6 text-center text-slate-600">Loading…</div>
      ) : error ? (
        <div className="py-6 text-center text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-md border border-accent/40 p-3">
              <div className="text-xs text-slate-600">Initiated</div>
              <div className="text-lg font-semibold text-primary">{data.buckets.initiated}</div>
            </div>
            <div className="rounded-md border border-accent/40 p-3">
              <div className="text-xs text-slate-600">Ringing</div>
              <div className="text-lg font-semibold text-primary">{data.buckets.ringing}</div>
            </div>
            <div className="rounded-md border border-accent/40 p-3">
              <div className="text-xs text-slate-600">In Process</div>
              <div className="text-lg font-semibold text-primary">{data.buckets.inProgress}</div>
            </div>
            <div className="rounded-md border border-accent/40 p-3">
              <div className="text-xs text-slate-600">Ended</div>
              <div className="text-lg font-semibold text-primary">{data.buckets.ended}</div>
            </div>
          </div>

          <div className="overflow-auto rounded-md border border-accent/40">
            <table className="min-w-full text-sm">
              <thead className="bg-accent/10 text-left text-xs text-slate-600">
                <tr>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Started</th>
                </tr>
              </thead>
              <tbody>
                {data.calls.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-600">No calls yet</td></tr>
                ) : data.calls.map((c) => (
                  <tr key={c.id} className="border-t border-accent/30">
                    <td className="px-3 py-2">{c.contactName || 'Unknown'}</td>
                    <td className="px-3 py-2">{c.phoneNumber || '-'}</td>
                    <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                    <td className="px-3 py-2">{c.duration ? `${Math.round(c.duration)}s` : '-'}</td>
                    <td className="px-3 py-2">{c.startedAt ? new Date(c.startedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}
