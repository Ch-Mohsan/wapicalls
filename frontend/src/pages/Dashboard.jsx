import React from 'react'

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-slate-600">Overview and quick stats</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Calls", "Leads", "Success", "Campaigns"].map((title) => (
          <div key={title} className="rounded-lg border bg-white/80 backdrop-blur p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">{title}</div>
              <div className="h-2 w-2 rounded-full bg-secondary" />
            </div>
            <div className="mt-3 text-2xl font-semibold text-primary">—</div>
            <div className="text-xs text-slate-500">This month</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard