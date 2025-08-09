import React from 'react'
import { Outlet } from 'react-router-dom'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-primary">
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        {/* Prefer Outlet over children for router layouts */}
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout