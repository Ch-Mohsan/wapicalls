import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import ProtectedLayout from './layouts/ProtectedLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Leads from './pages/Leads.jsx'
import Campaigns from './pages/Campaigns.jsx'
import CampaignNew from './pages/CampaignNew.jsx'
import CallHistory from './pages/CallHistory.jsx'
import Scripts from './pages/Scripts.jsx'
import Analytics from './pages/Analytics.jsx'
import Schedule from './pages/Schedule.jsx'
import Settings from './pages/Settings.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import { useAuth } from './store/AuthContext.jsx'

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-sm text-slate-600">Loading...</div>
    </div>
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        <Route element={<PublicLayout />}> 
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route element={<ProtectedLayout />}> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<CampaignNew />} />
          <Route path="/calls" element={<CallHistory />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Catch-all route - redirect to landing for unmatched routes */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
