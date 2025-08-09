import React from 'react'

function StatCard({ title, value, trend, icon }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-secondary/40 bg-white/80 p-5 shadow-sm transition-all hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-xl bg-secondary/30">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="mt-3 text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-slate-600">{title}</div>
    </div>
  )
}

export default StatCard