import React from 'react'
import DashboardLayout from './DashboardLayout.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { Navigate, useLocation, Outlet } from 'react-router-dom'

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 text-sm text-slate-600">Loading...</div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}

export default ProtectedLayout