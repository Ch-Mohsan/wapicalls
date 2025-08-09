import React from 'react'
import { Link } from 'react-router-dom'

function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-secondary/40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4">
        <button onClick={onMenuClick} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-secondary/40 text-primary hover:bg-secondary/20 md:hidden" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
          <span className="font-semibold tracking-tight text-primary">SellSynth</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/settings" className="inline-flex items-center rounded-md border border-secondary/40 bg-white px-3 py-1.5 text-sm text-primary shadow-sm hover:bg-secondary/20">Upgrade</Link>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-secondary/40 bg-white text-primary shadow-sm hover:bg-secondary/20" aria-label="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <Link to="/settings" className="h-8 w-8 rounded-full border border-secondary/40 bg-secondary/30" aria-label="Profile" />
        </div>
      </div>
    </header>
  )
}

export default Navbar