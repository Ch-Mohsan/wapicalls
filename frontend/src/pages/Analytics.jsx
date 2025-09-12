import React from 'react'
import { motion } from 'framer-motion'
import Card from '../components/Card.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import PageTransition from '../components/PageTransition.jsx'

function Analytics() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div 
          className="space-y-1"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-primary">Analytics</h1>
          <p className="text-sm text-slate-600">Performance and insights</p>
        </motion.div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {[{t:'Calls',v:'1,820'},{t:'Success',v:'38%'},{t:'Avg Call Time',v:'3m 42s'},{t:'Callbacks',v:'126'}].map((m, index)=> (
            <motion.div
              key={m.t}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            >
              <Card>
                <div className="text-sm text-slate-600">{m.t}</div>
                <div className="mt-2 text-2xl font-bold text-primary">{m.v}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid gap-4 lg:grid-cols-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card className="lg:col-span-2" title="Success Rate (30 days)" subtitle="Daily trend">
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-accent/40 bg-white/70">
                <div className="text-sm text-slate-600">Chart placeholder</div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Goal</span>
                  <span className="text-primary">50%</span>
                </div>
                <ProgressBar value={38} />
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Card title="Top Campaigns" subtitle="By success rate">
              <div className="space-y-3">
                {[{n:'Product Launch',s:42},{n:'Cold Outreach',s:31},{n:'Follow-up',s:29}].map((c, index)=> (
                  <motion.div 
                    key={c.n} 
                    className="flex items-center justify-between rounded-md border border-accent/40 bg-white p-3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-sm text-primary">{c.n}</div>
                    <div className="text-sm font-semibold text-primary">{c.s}%</div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default Analytics