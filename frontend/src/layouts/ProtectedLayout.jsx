import React from 'react'
import DashboardLayout from './DashboardLayout.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedLayout({ children }) {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="p-8 text-sm text-slate-600">Loading...</div>
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />

  return (
    <DashboardLayout>{children}</DashboardLayout>
  )
}

export default ProtectedLayout