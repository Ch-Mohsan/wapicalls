import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition.jsx'
import { useAuth } from '../store/AuthContext.jsx'

function Login() {
  const { login, clearError, error, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Clear errors when component mounts or auth error changes
  useEffect(() => {
    clearError()
    setFormErrors({})
  }, [clearError])

  // Helper function to get field-specific error
  const getFieldError = (field) => {
    if (formErrors[field]) return formErrors[field]
    if (error?.errors) {
      const fieldError = error.errors.find(err => err.field === field)
      if (fieldError) return fieldError.message
    }
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormErrors({})
    clearError()

    // Client-side validation
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required'
    if (!password) errors.password = 'Password is required'
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email.trim() && !emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setSubmitting(false)
      return
    }

    try {
      await login({ email: email.trim(), password })
      const to = location.state?.from?.pathname || '/dashboard'
      navigate(to, { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      
      // Handle field-specific errors
      if (err.errors) {
        const fieldErrors = {}
        err.errors.forEach(error => {
          fieldErrors[error.field] = error.message
        })
        setFormErrors(fieldErrors)
      }
      
      // If no specific field errors, the error will be shown via the global error from context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <motion.div 
        className="mx-auto max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="mb-6 text-center text-3xl font-bold text-primary"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome back
        </motion.h1>
        <motion.form 
          onSubmit={onSubmit} 
          className="space-y-4 rounded-lg border border-accent/40 bg-white/90 p-6 shadow-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
        
        {/* Global error message */}
        {error?.message && !error?.errors && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error.message}
          </div>
        )}

        {/* Email field */}
        <div>
          <label className="mb-1 block text-sm text-primary">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
              getFieldError('email') || getFieldError('credentials')
                ? 'border-red-400 focus:ring-red-200' 
                : 'border-accent/40 focus:ring-accent/40'
            }`}
            placeholder="Enter your email"
            disabled={submitting}
          />
          {getFieldError('email') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label className="mb-1 block text-sm text-primary">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
              getFieldError('password') || getFieldError('credentials')
                ? 'border-red-400 focus:ring-red-200' 
                : 'border-accent/40 focus:ring-accent/40'
            }`}
            placeholder="Enter your password"
            disabled={submitting}
          />
          {getFieldError('password') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
          )}
        </div>

        {/* Credentials error */}
        {getFieldError('credentials') && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {getFieldError('credentials')}
          </div>
        )}

        {/* Submit button */}
        <motion.button 
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-md bg-secondary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </motion.button>
      </motion.form>
      
      <motion.p 
        className="mt-3 text-center text-sm text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Don&apos;t have an account?{' '}
        <Link className="text-secondary underline hover:text-secondary/80" to="/signup">
          Sign up
        </Link>
      </motion.p>
    </motion.div>
    </PageTransition>
  )
}

export default Login