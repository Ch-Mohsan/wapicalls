import React from 'react'
import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/50 px-3 py-1 text-xs text-primary">New • Blazing fast AI calling</div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-6xl">Grow faster with intelligent calling</h1>
        <p className="mx-auto max-w-2xl text-slate-600">SellSynth helps teams manage leads and run automated call campaigns with actionable analytics. Get started in minutes.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/signup" className="rounded-md bg-secondary px-5 py-3 text-white shadow hover:opacity-90">Get Started</Link>
          <Link to="/login" className="rounded-md border border-accent/50 px-5 py-3 text-primary hover:bg-accent/20">Sign In</Link>
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-accent/40 bg-white/80 p-5 shadow-sm">
          <div className="text-sm font-semibold text-primary">Automated dialing</div>
          <div className="text-sm text-slate-600">Set sequences that call your leads with smart retry logic.</div>
        </div>
        <div className="rounded-lg border border-accent/40 bg-white/80 p-5 shadow-sm">
          <div className="text-sm font-semibold text-primary">Unified inbox</div>
          <div className="text-sm text-slate-600">Track conversations and outcomes in one place.</div>
        </div>
      </div>
    </div>
  )
}

export default Landing