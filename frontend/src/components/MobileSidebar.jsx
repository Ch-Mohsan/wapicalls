import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: 'home', to: '/' },
  { label: 'Leads', icon: 'users', to: '/leads' },
  { label: 'Campaigns', icon: 'target', to: '/campaigns' },
  { label: 'Scripts', icon: 'file-text', to: '/scripts' },
  { label: 'Analytics', icon: 'chart', to: '/analytics' },
  { label: 'Schedule', icon: 'calendar', to: '/schedule' },
  { label: 'Settings', icon: 'settings', to: '/settings' },
]

function Icon({ name, className }) {
  switch (name) {
    case 'home':
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/></svg>
    case 'users':
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'target':
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    case 'file-text':
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
    case 'chart':
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
    case 'calendar':
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
    case 'settings':
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 20.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4 16.82a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 10a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 10c0 .26.03.52.09.77"/></svg>
    default:
      return null
  }
}

function MobileSidebar({ open, onClose }) {
  return (
    <div className={["fixed inset-0 z-50 md:hidden", open ? "" : "pointer-events-none"].join(' ')}>
      <div className={["absolute inset-0 bg-black/30 transition-opacity", open ? "opacity-100" : "opacity-0"].join(' ')} onClick={onClose} />
      <div className={["absolute inset-y-0 left-0 w-64 bg-white border-r border-accent/40 shadow-xl transition-transform", open ? "translate-x-0" : "-translate-x-full"].join(' ')}>
        <div className="flex h-14 items-center gap-2 border-b border-accent/40 px-4">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-accent" />
          <span className="text-sm font-semibold tracking-tight text-primary">SellSynth</span>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} onClick={onClose} className={({ isActive }) => [
              'group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              isActive ? 'bg-accent/30 text-primary' : 'text-slate-700 hover:bg-accent/20 hover:text-primary'
            ].join(' ')}>
              <Icon name={item.icon} className="h-4 w-4 text-slate-500 group-[.bg-accent\/30]:text-primary group-hover:text-primary" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default MobileSidebar