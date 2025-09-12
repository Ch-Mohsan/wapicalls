import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition.jsx'
import { useAuth } from '../store/AuthContext.jsx'

function Signup() {
  const { register, clearError, error, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Clear errors when component mounts
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
    
    if (!name.trim()) {
      errors.name = 'Name is required'
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long'
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address'
      }
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setSubmitting(false)
      return
    }

    try {
      await register({ 
        name: name.trim(), 
        email: email.trim(), 
        password, 
        confirmPassword 
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Registration error:', err)
      
      // Handle field-specific errors
      if (err.errors) {
        const fieldErrors = {}
        err.errors.forEach(error => {
          fieldErrors[error.field] = error.message
        })
        setFormErrors(fieldErrors)
      }
      
      // Global error will be shown via the error from context
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
          Create your account
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

        {/* Name field */}
        <div>
          <label className="mb-1 block text-sm text-primary">Name</label>
          <input 
            type="text"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
              getFieldError('name')
                ? 'border-red-400 focus:ring-red-200' 
                : 'border-accent/40 focus:ring-accent/40'
            }`}
            placeholder="Enter your full name"
            disabled={submitting}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label className="mb-1 block text-sm text-primary">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
              getFieldError('email')
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
              getFieldError('password')
                ? 'border-red-400 focus:ring-red-200' 
                : 'border-accent/40 focus:ring-accent/40'
            }`}
            placeholder="Create a password (min. 6 characters)"
            disabled={submitting}
          />
          {getFieldError('password') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
          )}
        </div>

        {/* Confirm Password field */}
        <div>
          <label className="mb-1 block text-sm text-primary">Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
              getFieldError('confirmPassword')
                ? 'border-red-400 focus:ring-red-200' 
                : 'border-accent/40 focus:ring-accent/40'
            }`}
            placeholder="Confirm your password"
            disabled={submitting}
          />
          {getFieldError('confirmPassword') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('confirmPassword')}</p>
          )}
        </div>

        {/* Submit button */}
        <motion.button 
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-md bg-secondary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </motion.button>
      </motion.form>
      
      <motion.p 
        className="mt-3 text-center text-sm text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Already have an account?{' '}
        <Link className="text-secondary underline hover:text-secondary/80" to="/login">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
    </PageTransition>
  )
}

export default Signup