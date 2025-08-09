import React from 'react'
import Card from '../components/Card.jsx'
import ProgressBar from '../components/ProgressBar.jsx'

function Analytics() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Analytics</h1>
        <p className="text-sm text-slate-600">Performance and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[{t:'Calls',v:'1,820'},{t:'Success',v:'38%'},{t:'Avg Call Time',v:'3m 42s'},{t:'Callbacks',v:'126'}].map((m)=> (
          <Card key={m.t}>
            <div className="text-sm text-slate-600">{m.t}</div>
            <div className="mt-2 text-2xl font-bold text-primary">{m.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Success Rate (30 days)" subtitle="Daily trend">
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-accent/40 bg-white/70">
            <div className="text-sm text-slate-600">Chart placeholder</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Goal</span>
              <span className="text-primary">50%</span>
            </div>
            <ProgressBar value={38} />
          </div>
        </Card>
        <Card title="Top Campaigns" subtitle="By success rate">
          <div className="space-y-3">
            {[{n:'Product Launch',s:42},{n:'Cold Outreach',s:31},{n:'Follow-up',s:29}].map((c)=> (
              <div key={c.n} className="flex items-center justify-between rounded-md border border-accent/40 bg-white p-3">
                <div className="text-sm text-primary">{c.n}</div>
                <div className="text-sm font-semibold text-primary">{c.s}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Analytics