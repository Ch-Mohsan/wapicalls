import React from 'react'
import Card from '../components/Card.jsx'

const SCRIPTS = [
  { id: 'S1', title: 'Intro Cold Call', updatedAt: '2025-07-10', usage: 124 },
  { id: 'S2', title: 'Follow-up After Demo', updatedAt: '2025-07-06', usage: 212 },
  { id: 'S3', title: 'Upsell Outreach', updatedAt: '2025-07-01', usage: 78 },
]

function Scripts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Scripts</h1>
          <p className="text-sm text-slate-600">Create and manage call scripts</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-accent/40 bg-white px-3 py-2 text-sm text-primary hover:bg-accent/20">Import</button>
          <button className="rounded-md bg-secondary px-3 py-2 text-sm text-white hover:opacity-90">New Script</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SCRIPTS.map((s) => (
          <Card key={s.id} title={s.title} subtitle={`Updated ${s.updatedAt}`} actions={
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-accent/40 px-2 py-1 text-xs text-primary hover:bg-accent/20">Edit</button>
              <button className="rounded-md border border-accent/40 px-2 py-1 text-xs text-primary hover:bg-accent/20">Duplicate</button>
            </div>
          }>
            <div className="text-sm text-slate-600">Usage: <span className="font-medium text-primary">{s.usage}</span></div>
            <div className="mt-3 rounded-md border border-accent/40 bg-white p-3 text-xs text-slate-600">
              <div className="mb-2 font-semibold text-primary">Preview</div>
              <p>Hi, this is Alex from Acme. We help teams reduce time-to-close by up to 30%. Do you have a minute?</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Scripts