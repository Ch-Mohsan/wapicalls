import React, { useState } from 'react'
import Card from '../components/Card.jsx'

function Settings() {
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('demo@example.com')

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Settings</h1>
        <p className="text-sm text-slate-600">Preferences and account</p>
      </div>

      <Card title="Profile" subtitle="Update your personal info" actions={<button className="rounded-md bg-secondary px-3 py-1.5 text-sm text-white hover:opacity-90">Save</button>}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-primary">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-primary">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
        </div>
      </Card>

      <Card title="Theme" subtitle="Preview brand colors">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-accent/40 p-3 text-center">
            <div className="h-10 w-full rounded bg-[var(--color-primary)]" />
            <div className="mt-2 text-xs text-slate-600">Primary</div>
          </div>
          <div className="rounded-md border border-accent/40 p-3 text-center">
            <div className="h-10 w-full rounded bg-[var(--color-secondary)]" />
            <div className="mt-2 text-xs text-slate-600">Secondary</div>
          </div>
          <div className="rounded-md border border-accent/40 p-3 text-center">
            <div className="h-10 w-full rounded bg-[var(--color-accent)]" />
            <div className="mt-2 text-xs text-slate-600">Accent</div>
          </div>
          <div className="rounded-md border border-accent/40 p-3 text-center">
            <div className="h-10 w-full rounded bg-[var(--color-background)] border border-accent/40" />
            <div className="mt-2 text-xs text-slate-600">Background</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Settings