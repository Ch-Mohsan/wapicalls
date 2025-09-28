import React from 'react'
import { motion } from 'framer-motion'
import Card from './Card.jsx'
import Badge from './Badge.jsx'
import ProgressBar from './ProgressBar.jsx'

function Icon({ name, className = 'h-4 w-4' }) {
  switch (name) {
    case 'play':
      return (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>)
    case 'info':
      return (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>)
    case 'trash':
      return (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>)
    default:
      return null
  }
}

export default function CampaignCard({ campaign, onStart, onDetails, onDelete, starting = false, buckets = {} }) {
  const { id, name, status, progress = 0, totalCalls = 0, successRate = 0 } = campaign
  const badgeVariant = status === 'Running' ? 'success' : status === 'Paused' ? 'warning' : status === 'Completed' ? 'info' : 'default'
  const b = {
    initiated: buckets.initiated || 0,
    ringing: buckets.ringing || 0,
    inProgress: buckets.inProgress || 0,
    ended: buckets.ended || 0,
  }

  return (
    <Card className="p-0">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold text-primary tracking-tight" title={name}>{name}</div>
            <div className="mt-1 text-xs font-medium text-slate-500 truncate" title={id}>ID: {id}</div>
          </div>
          <Badge variant={badgeVariant}>
            {status}
          </Badge>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide font-medium text-slate-600">
            <span>Progress</span>
            <span className="text-primary text-xs normal-case font-semibold">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        <div className="grid gap-5 md:grid-cols-5">
          <div className="col-span-2 grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary leading-none">{totalCalls}</div>
              <div className="mt-1 text-xs font-medium text-slate-600">Calls</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary leading-none">{successRate}%</div>
              <div className="mt-1 text-xs font-medium text-slate-600">Success</div>
            </div>
          </div>
          <div className="md:col-span-3 grid grid-cols-4 gap-3">
            {[
              { label: 'Initiated', value: b.initiated },
              { label: 'Ringing', value: b.ringing },
              { label: 'In Process', value: b.inProgress },
              { label: 'Ended', value: b.ended },
            ].map(stat => (
              <div key={stat.label} className="rounded-lg border border-accent/40 bg-white/60 p-3 flex flex-col items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 mb-1 text-center leading-tight">{stat.label}</div>
                <div className="text-lg font-semibold text-primary leading-none">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <motion.button
            onClick={onStart}
            disabled={starting}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-xs font-semibold text-white shadow hover:shadow-md transition disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon name="play" className="h-4 w-4" /> {starting ? 'Starting…' : 'Start'}
          </motion.button>
          <motion.button
            onClick={onDetails}
            className="inline-flex items-center gap-2 rounded-md border border-accent/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-accent/20 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon name="info" className="h-4 w-4" /> Details
          </motion.button>
          <motion.button
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon name="trash" className="h-4 w-4" /> Delete
          </motion.button>
        </div>
      </div>
    </Card>
  )
}
