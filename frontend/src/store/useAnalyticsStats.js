import { useEffect, useMemo, useState } from 'react'
import { ApiClient } from './apiClient.js'

export function useAnalyticsStats() {
  const [calls, setCalls] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const [callsRes, campRes] = await Promise.all([
        ApiClient.get('/api/calls'),
        ApiClient.get('/api/campaigns')
      ])
      const callsData = Array.isArray(callsRes) ? callsRes : (callsRes?.data || [])
      const campData = Array.isArray(campRes) ? campRes : (campRes?.data || [])
      setCalls(callsData)
      setCampaigns(campData)
    } catch (e) {
      setError(e?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const stats = useMemo(() => {
    if (!calls?.length) {
      // Provide empty default series for charts
      const today = new Date()
      const days = [...Array(30)].map((_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (29 - i))
        return { date: d.toISOString().slice(0,10), rate: 0 }
      })
      return { total: 0, successRate: 0, avgDurationSec: 0, callbacks: 0, success30: 0, topCampaigns: [], trend30: days }
    }
    const normalizeDur = (c) => {
      if (typeof c.duration === 'number' && c.duration > 0) return c.duration
      if (c.startedAt && c.endedAt) {
        const d = (new Date(c.endedAt) - new Date(c.startedAt)) / 1000
        return d > 0 ? Math.floor(d) : 0
      }
      return 0
    }
    const total = calls.length
    const completed = calls.filter(c => String(c.status).toLowerCase() === 'completed').length
    const successRate = total ? Math.round((completed / total) * 100) : 0
    const avgDurationSec = Math.round(calls.map(normalizeDur).reduce((a,b)=>a+b,0) / Math.max(1,total))
    const callbacks = calls.filter(c => c.followUpRequired).length

    const thirtyDaysAgo = Date.now() - 30*24*60*60*1000
    const last30 = calls.filter(c => new Date(c.createdAt || c.updatedAt || Date.now()).getTime() >= thirtyDaysAgo)
    const last30Completed = last30.filter(c => String(c.status).toLowerCase() === 'completed').length
    const success30 = last30.length ? Math.round((last30Completed/last30.length)*100) : 0

    // Build 30-day success rate trend (per day)
    const today = new Date()
    const dayKey = (d) => new Date(d).toISOString().slice(0,10)
    const windowDays = [...Array(30)].map((_, idx) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (29 - idx))
      return dayKey(d)
    })
    const perDay = new Map(windowDays.map(k => [k, { total: 0, completed: 0 }]))
    for (const c of last30) {
      const k = dayKey(c.createdAt || c.updatedAt || Date.now())
      if (!perDay.has(k)) continue
      const v = perDay.get(k)
      v.total += 1
      if (String(c.status).toLowerCase() === 'completed') v.completed += 1
      perDay.set(k, v)
    }
    const trend30 = windowDays.map(k => {
      const v = perDay.get(k) || { total: 0, completed: 0 }
      const rate = v.total ? Math.round((v.completed / v.total) * 100) : 0
      return { date: k, rate }
    })

    const byCamp = new Map()
    for (const c of calls) {
      const id = c.campaign?._id || c.campaign || null
      if (!id) continue
      const entry = byCamp.get(id) || { total: 0, completed: 0 }
      entry.total += 1
      if (String(c.status).toLowerCase() === 'completed') entry.completed += 1
      byCamp.set(id, entry)
    }
    const campName = (id) => {
      const found = campaigns.find(x => (x._id || x.id) === id)
      return found?.name || 'Untitled'
    }
    const topCampaigns = Array.from(byCamp.entries()).map(([id, {total, completed}]) => ({
      id,
      name: campName(id),
      rate: total ? Math.round((completed/total)*100) : 0
    })).sort((a,b)=> b.rate - a.rate).slice(0,3)

    return { total, successRate, avgDurationSec, callbacks, success30, topCampaigns, trend30 }
  }, [calls, campaigns])

  return { stats, loading, error, reload, calls, campaigns }
}
