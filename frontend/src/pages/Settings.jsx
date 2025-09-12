import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/Card.jsx'
import PageTransition from '../components/PageTransition.jsx'

function Settings() {
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('demo@example.com')

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div 
          className="space-y-1"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-primary">Settings</h1>
          <p className="text-sm text-slate-600">Preferences and account</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card title="Profile" subtitle="Update your personal info" actions={
            <motion.button 
              className="rounded-md bg-secondary px-3 py-1.5 text-sm text-white hover:opacity-90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </motion.button>
          }>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-primary">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-primary">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
        </div>
      </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card title="Theme" subtitle="Preview brand colors">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { color: 'var(--color-primary)', name: 'Primary' },
              { color: 'var(--color-secondary)', name: 'Secondary' },
              { color: 'var(--color-accent)', name: 'Accent' },
              { color: 'var(--color-background)', name: 'Background' }
            ].map((theme, index) => (
              <motion.div 
                key={theme.name}
                className="rounded-md border border-accent/40 p-3 text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <div 
                  className={`h-10 w-full rounded ${theme.name === 'Background' ? 'border border-accent/40' : ''}`}
                  style={{ backgroundColor: theme.color }}
                />
                <div className="mt-2 text-xs text-slate-600">{theme.name}</div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
      </div>
    </PageTransition>
  )
}

export default Settings