import React from 'react'

function StatCard({ title, value, trend, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-accent/30 bg-white/85 p-5 shadow-sm transition-all hover:shadow-md border-l-4 border-l-[var(--color-accent)]/25 hover:border-l-[var(--color-accent)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/8 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-[var(--color-secondary)]/10 p-2 transition-transform group-hover:scale-105">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold text-green-700">
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