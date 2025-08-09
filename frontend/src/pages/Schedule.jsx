import React from 'react'
import Card from '../components/Card.jsx'

const UPCOMING = [
  { id: 'EV1', title: 'Call: Olivia Brown', at: '2025-07-23 10:30', campaign: 'Follow-up Nurture' },
  { id: 'EV2', title: 'Call: Liam Johnson', at: '2025-07-23 11:00', campaign: 'Cold Outreach - Q3' },
  { id: 'EV3', title: 'Demo: Ava Smith', at: '2025-07-23 14:00', campaign: 'Product Launch - Wave A' },
]

function Schedule() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Schedule</h1>
        <p className="text-sm text-slate-600">Plan and manage calls</p>
      </div>

      <Card title="Upcoming Calls" subtitle="Today">
        <div className="space-y-3">
          {UPCOMING.map((e)=> (
            <div key={e.id} className="flex items-center justify-between rounded-md border border-accent/40 bg-white p-3">
              <div>
                <div className="text-sm font-medium text-primary">{e.title}</div>
                <div className="text-xs text-slate-600">{e.at} • {e.campaign}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-md border border-accent/40 px-2 py-1 text-xs hover:bg-accent/20">Reschedule</button>
                <button className="rounded-md bg-secondary px-2 py-1 text-xs text-white hover:opacity-90">Start</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Schedule