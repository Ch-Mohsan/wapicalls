import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import MobileSidebar from '../components/MobileSidebar.jsx'

function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-primary">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <Sidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="md:pl-60 pt-14">
        <main className="mx-auto max-w-screen-2xl p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout