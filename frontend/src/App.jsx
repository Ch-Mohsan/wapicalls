import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Leads from './pages/Leads.jsx'
import Campaigns from './pages/Campaigns.jsx'
import Scripts from './pages/Scripts.jsx'
import Analytics from './pages/Analytics.jsx'
import Schedule from './pages/Schedule.jsx'
import Settings from './pages/Settings.jsx'

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  )
}

export default App
