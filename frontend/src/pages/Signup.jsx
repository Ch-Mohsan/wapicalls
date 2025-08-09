import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext.jsx'

function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      // Replace with backend /auth/signup then login
      await login({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.data?.message || 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-3xl font-bold text-primary">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-accent/40 bg-white/90 p-6 shadow-sm">
        {error && <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <div>
          <label className="mb-1 block text-sm text-primary">Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} required className="w-full rounded-md border border-accent/40 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-primary">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full rounded-md border border-accent/40 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-primary">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full rounded-md border border-accent/40 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40" />
        </div>
        <button disabled={submitting} className="w-full rounded-md bg-secondary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60">{submitting? 'Creating...' : 'Create account'}</button>
      </form>
      <p className="mt-3 text-center text-sm text-slate-600">Already have an account? <Link className="text-secondary underline" to="/login">Sign in</Link></p>
    </div>
  )
}

export default Signup