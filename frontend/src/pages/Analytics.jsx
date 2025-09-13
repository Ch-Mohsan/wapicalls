import React from 'react'
import { motion } from 'framer-motion'
import Card from '../components/Card.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useAnalyticsStats } from '../store/useAnalyticsStats.js'
import LineChart from '../components/LineChart.jsx'

function formatDurationSec(sec) {
  const s = Math.max(0, Math.floor(sec || 0))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}

function Analytics() {
  const { stats, loading, error } = useAnalyticsStats()

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

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {[
            {t:'Calls',v: loading ? '—' : stats.total.toLocaleString()},
            {t:'Success',v: loading ? '—' : `${stats.successRate}%`},
            {t:'Avg Call Time',v: loading ? '—' : formatDurationSec(stats.avgDurationSec)},
            {t:'Callbacks',v: loading ? '—' : stats.callbacks.toLocaleString()},
          ].map((m, index)=> (
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
            <Card className="lg:col-span-2" title="Success Rate (30 days)" subtitle={loading ? 'Loading…' : `Daily trend`}>
              <div className="rounded-lg border border-accent/30 bg-white/70 px-2 py-3">
                {loading ? (
                  <div className="flex h-64 items-center justify-center text-sm text-slate-600">Loading chart…</div>
                ) : (
                  <LineChart data={stats.trend30} height={260} />
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Goal</span>
                  <span className="text-primary">50%</span>
                </div>
                <ProgressBar value={loading ? 0 : stats.success30} />
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
                {(loading ? [] : stats.topCampaigns).map((c, index)=> (
                  <motion.div 
                    key={c.id} 
                    className="flex items-center justify-between rounded-md border border-accent/40 bg-white p-3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-sm text-primary">{c.name}</div>
                    <div className="text-sm font-semibold text-primary">{c.rate}%</div>
                  </motion.div>
                ))}
                {!loading && stats.topCampaigns.length === 0 && (
                  <div className="text-sm text-slate-600">No campaign data yet.</div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default Analytics