import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast.jsx'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, duration)
    }
    
    return id
  }, [])

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message, duration) => showToast(message, 'success', duration), [showToast])
  const showError = useCallback((message, duration) => showToast(message, 'error', duration), [showToast])
  const showWarning = useCallback((message, duration) => showToast(message, 'warning', duration), [showToast])
  const showInfo = useCallback((message, duration) => showToast(message, 'info', duration), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, hideToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {/* Render toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => hideToast(toast.id)}
            duration={0} // Handled by context
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
