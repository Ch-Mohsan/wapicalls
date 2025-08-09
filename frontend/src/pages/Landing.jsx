import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'

function Landing() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/50 px-3 py-1 text-xs text-primary">New • Blazing fast AI calling</div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">Grow faster with intelligent calling</h1>
        <p className="mx-auto max-w-2xl text-slate-600">SellSynth helps teams manage leads and run automated call campaigns with actionable analytics. Get started in minutes.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/signup" className="rounded-md bg-secondary px-5 py-3 text-white shadow hover:opacity-90">Get Started</Link>
          <Link to="/login" className="rounded-md border border-accent/50 px-5 py-3 text-primary hover:bg-accent/20">Sign In</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Automated dialing" subtitle="Smart sequences and retries">
          <div className="text-sm text-slate-600">Set sequences that call your leads with smart retry logic.</div>
        </Card>
        <Card title="Unified inbox" subtitle="Track outcomes easily">
          <div className="text-sm text-slate-600">Conversations in one place across campaigns.</div>
        </Card>
      </div>
    </div>
  )
}

export default Landing