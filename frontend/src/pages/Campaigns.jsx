import React from 'react'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import ProgressBar from '../components/ProgressBar.jsx'

const CAMPAIGNS = [
  { id: 'C101', name: 'Cold Outreach - Q3', status: 'Running', progress: 62, calls: 820, success: 31 },
  { id: 'C102', name: 'Product Launch - Wave A', status: 'Scheduled', progress: 0, calls: 0, success: 0 },
  { id: 'C103', name: 'Follow-up Nurture', status: 'Paused', progress: 54, calls: 410, success: 42 },
  { id: 'C104', name: 'Event Invitation', status: 'Completed', progress: 100, calls: 1200, success: 36 },
]

function Campaigns() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Campaigns</h1>
          <p className="text-sm text-slate-600">Create and track campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-accent/40 bg-white px-3 py-2 text-sm text-primary hover:bg-accent/20">Import</button>
          <button className="rounded-md bg-secondary px-3 py-2 text-sm text-white hover:opacity-90">New Campaign</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CAMPAIGNS.map((c) => (
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
                <span className="text-primary font-medium">{c.progress}%</span>
              </div>
              <ProgressBar value={c.progress} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-semibold text-primary">{c.calls}</div>
                <div className="text-xs text-slate-600">Calls</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-primary">{c.success}%</div>
                <div className="text-xs text-slate-600">Success</div>
              </div>
              <div className="flex items-center justify-center">
                <button className="rounded-md border border-accent/40 px-3 py-1 text-xs text-primary hover:bg-accent/20">Details</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Campaigns