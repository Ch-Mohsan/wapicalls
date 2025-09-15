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
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold text-primary" title={name}>{name}</div>
          <div className="mt-0.5 text-xs text-slate-600 truncate" title={id}>ID: {id}</div>
        </div>
        <Badge variant={badgeVariant}>{status}</Badge>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-600">Progress</span>
          <span className="font-medium text-primary">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-6 order-2 lg:order-1">
          <div>
            <div className="text-xl font-semibold text-primary">{totalCalls}</div>
            <div className="text-xs text-slate-600">Calls</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-primary">{successRate}%</div>
            <div className="text-xs text-slate-600">Success</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center order-1 lg:order-2">
          <div className="rounded-md border border-accent/40 p-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-600">Initiated</div>
            <div className="text-sm font-semibold text-primary">{b.initiated}</div>
          </div>
          <div className="rounded-md border border-accent/40 p-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-600">Ringing</div>
            <div className="text-sm font-semibold text-primary">{b.ringing}</div>
          </div>
          <div className="rounded-md border border-accent/40 p-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-600">In Process</div>
            <div className="text-sm font-semibold text-primary">{b.inProgress}</div>
          </div>
          <div className="rounded-md border border-accent/40 p-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-600">Ended</div>
            <div className="text-sm font-semibold text-primary">{b.ended}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
          <motion.button
            onClick={onStart}
            disabled={starting}
            className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-white hover:opacity-95 disabled:opacity-60"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Start Campaign"
          >
            <Icon name="play" className="h-3.5 w-3.5" /> {starting ? 'Starting…' : 'Start'}
          </motion.button>
          <motion.button
            onClick={onDetails}
            className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 px-3 py-1.5 text-xs font-medium text-primary hover:bg-accent/20"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="View Details"
          >
            <Icon name="info" /> Details
          </motion.button>
          <motion.button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Delete Campaign"
          >
            <Icon name="trash" /> Delete
          </motion.button>
        
      </div>
    </Card>
  )
}
