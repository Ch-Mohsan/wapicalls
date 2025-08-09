import React from 'react'
import StatCard from '../components/StatCard.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import Card from '../components/Card.jsx'
import { Link } from 'react-router-dom'

function Icon({ name, className = 'h-5 w-5 text-primary' }) {
  switch (name) {
    case 'phone':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.1.99.35 1.95.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.86.35 1.82.6 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    case 'users':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'check':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
    case 'trend':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
    case 'activity':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
    case 'calendar':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
    default:
      return null
  }
}

function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
          <p className="text-sm text-slate-600">Track performance and manage campaigns</p>
        </div>
        <Link to="/campaigns" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90">
          <Icon name="phone" className="h-4 w-4 text-white" />
          New Campaign
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Calls" value="573" trend="+12%" icon={<Icon name="phone" />} />
        <StatCard title="Active Leads" value="1,234" trend="+20.1%" icon={<Icon name="users" />} />
        <StatCard title="Success Rate" value="38.5%" trend="+1.5%" icon={<Icon name="trend" />} />
        <StatCard title="Active Campaigns" value="5" trend="+3" icon={<Icon name="check" />} />
      </div>

      {/* Analytics + Quick Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title={<div className="flex items-center gap-2"><Icon name="activity" /><span>Call Performance</span></div>} subtitle="Detailed analytics for the last 30 days" actions={<span className="rounded-full border border-secondary/40 px-3 py-1 text-xs">Live Data</span>}>
          <div className="relative h-[280px] rounded-xl border-2 border-dashed border-secondary/40 bg-secondary/20 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Icon name="trend" className="mx-auto h-10 w-10 text-primary" />
              <div className="text-sm text-slate-600">Analytics visualization placeholder</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">47</div>
              <div className="text-sm text-slate-600">Calls Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">18</div>
              <div className="text-sm text-slate-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-700">12</div>
              <div className="text-sm text-slate-600">Callbacks</div>
            </div>
          </div>
        </Card>

        <Card title={<div className="flex items-center gap-2"><Icon name="calendar" /><span>Recent Activity</span></div>} subtitle="Latest updates from your campaigns">
          <div className="space-y-3">
            {[{ t: 'Campaign "Q4 Follow-up" launched successfully', tag: 'success' }, { t: '50 new leads imported to database', tag: 'info' }, { t: "Campaign 'Welcome Calls' completed", tag: 'success' }].map((item, i) => (
              <div key={i} className="group flex items-start gap-3 rounded-md p-3 hover:bg-secondary/20">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-secondary/30" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-primary group-hover:opacity-90">{item.t}</div>
                  <div className="text-xs text-slate-600">{i === 0 ? '2 hours ago' : i === 1 ? '1 day ago' : '3 days ago'}</div>
                </div>
                <span className={["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", item.tag === 'success' ? 'bg-primary text-white' : 'bg-secondary/40 text-primary'].join(' ')}>{item.tag}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title={<div className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg><span>Quick Actions</span></div>} subtitle="Streamline your workflow with one-click actions">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link to="/leads" className="inline-flex flex-col items-center gap-2 rounded-md border border-secondary/40 bg-white p-4 text-sm text-primary hover:bg-secondary/20">
            <Icon name="users" />
            Import Leads
          </Link>
          <Link to="/scripts" className="inline-flex flex-col items-center gap-2 rounded-md border border-secondary/40 bg-white p-4 text-sm text-primary hover:bg-secondary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
            Create Script
          </Link>
          <Link to="/analytics" className="inline-flex flex-col items-center gap-2 rounded-md border border-secondary/40 bg-white p-4 text-sm text-primary hover:bg-secondary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            View Reports
          </Link>
          <Link to="/schedule" className="inline-flex flex-col items-center gap-2 rounded-md border border-secondary/40 bg-white p-4 text-sm text-primary hover:bg-secondary/20">
            <Icon name="calendar" />
            Schedule Calls
          </Link>
        </div>
      </Card>

      {/* Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>Quick Start Templates</h2>
            <p className="text-sm text-slate-600">Launch proven campaign strategies in minutes</p>
          </div>
          <Link to="/scripts" className="inline-flex items-center gap-2 rounded-md border border-secondary/40 bg-white px-4 py-2 text-sm text-primary hover:bg-secondary/20">View All Templates<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[{t:'Cold Outreach',d:'Reach new prospects with personalized messaging.'},{t:'Product Launch',d:'Announce new products to your audience.'},{t:'Follow-up',d:'Re-engage warm leads and nurture.'},{t:'Event Invitation',d:'Invite prospects to webinars and demos.'}].map((tpl, idx) => (
            <div key={idx} className="group cursor-pointer overflow-hidden rounded-lg border border-secondary/40 bg-white/80 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
              <div className="p-6">
                <div className="mb-3 w-fit rounded-2xl bg-secondary/30 p-4"><Icon name={idx===0?'trend':idx===1?'activity':idx===2?'check':'calendar'} /></div>
                <div className="text-lg font-semibold text-primary group-hover:opacity-90">{tpl.t}</div>
                <div className="mt-1 text-sm text-slate-600">{tpl.d}</div>
              </div>
              <div className="flex items-center justify-between border-t border-secondary/40 px-6 py-4 text-xs text-slate-600">
                <div className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 2-3 hours</div>
                <div className="flex items-center gap-2 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> 24% success</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard