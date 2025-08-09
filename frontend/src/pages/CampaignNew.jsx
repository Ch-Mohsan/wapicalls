import React, { useState } from 'react'
import Card from '../components/Card.jsx'
import { useNavigate } from 'react-router-dom'

function CampaignNew() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('Cold Leads')
  const [startAt, setStartAt] = useState('')
  const [script, setScript] = useState('Intro Cold Call')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r)=>setTimeout(r,300))
    navigate('/campaigns', { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Create Campaign</h1>
        <p className="text-sm text-slate-600">Configure details and start</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-primary">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} required className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-primary">Target List</label>
            <select value={target} onChange={(e)=>setTarget(e.target.value)} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40">
              <option>Cold Leads</option>
              <option>Warm Leads</option>
              <option>All Customers</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-primary">Start At</label>
            <input type="datetime-local" value={startAt} onChange={(e)=>setStartAt(e.target.value)} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-primary">Script</label>
            <select value={script} onChange={(e)=>setScript(e.target.value)} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40">
              <option>Intro Cold Call</option>
              <option>Follow-up After Demo</option>
              <option>Upsell Outreach</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <button disabled={submitting} className="rounded-md bg-secondary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60">{submitting ? 'Creating...' : 'Create Campaign'}</button>
            <button type="button" onClick={()=>navigate('/campaigns')} className="rounded-md border border-accent/40 px-4 py-2 text-sm text-primary hover:bg-accent/20">Cancel</button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CampaignNew