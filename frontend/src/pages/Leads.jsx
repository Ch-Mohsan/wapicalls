import React, { useMemo, useState } from 'react'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { Table } from '../components/Table.jsx'

const MOCK_LEADS = Array.from({ length: 28 }).map((_, i) => ({
  id: `L${1000 + i}`,
  name: [
    'Ava Smith', 'Liam Johnson', 'Olivia Brown', 'Noah Davis', 'Emma Wilson', 'Sophia Martinez', 'James Anderson', 'Mia Thomas',
    'Benjamin Taylor', 'Charlotte Moore', 'Elijah Jackson', 'Amelia White', 'Lucas Harris', 'Harper Clark', 'Mason Lewis', 'Evelyn Young',
  ][i % 16],
  email: `lead${i}@example.com`,
  phone: `+1 (555) ${String(1000 + i).slice(0,3)}-${String(1000 + i).slice(1)}`,
  status: ['New', 'Contacted', 'Qualified', 'Lost'][i % 4],
  score: [72, 35, 88, 55, 63, 94, 41, 77][i % 8],
  createdAt: `2025-07-${(i % 28) + 1}`,
}))

function Leads() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [page, setPage] = useState(1)
  const pageSize = 8

  const filtered = useMemo(() => {
    return MOCK_LEADS.filter((l) =>
      (!query || l.name.toLowerCase().includes(query.toLowerCase()) || l.email.includes(query)) &&
      (!status || l.status === status)
    )
  }, [query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', render: (value) => {
      const variant = value === 'Qualified' ? 'success' : value === 'Contacted' ? 'info' : value === 'Lost' ? 'danger' : 'default'
      return <Badge variant={variant}>{value}</Badge>
    } },
    { key: 'score', header: 'Score' },
    { key: 'createdAt', header: 'Created' },
  ]

  const getRowId = (r) => r.id
  const onToggleRow = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }
  const onToggleAll = () => {
    if (paged.every((r) => selected.has(getRowId(r)))) {
      const next = new Set(selected)
      paged.forEach((r) => next.delete(getRowId(r)))
      setSelected(next)
    } else {
      const next = new Set(selected)
      paged.forEach((r) => next.add(getRowId(r)))
      setSelected(next)
    }
  }

  const clearFilters = () => { setQuery(''); setStatus(''); setPage(1) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Leads</h1>
          <p className="text-sm text-slate-600">Manage and import leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-accent/40 bg-white px-3 py-2 text-sm text-primary hover:bg-accent/20">Import CSV</button>
          <button className="rounded-md bg-secondary px-3 py-2 text-sm text-white hover:opacity-90">New Lead</button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-600">Search</label>
            <div className="flex items-center gap-2">
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search by name or email" className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <div className="w-full md:w-60">
            <label className="mb-1 block text-xs text-slate-600">Status</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40">
              <option value="">All</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Qualified</option>
              <option>Lost</option>
            </select>
          </div>
          <div className="self-end md:self-auto">
            <button onClick={clearFilters} className="rounded-md border border-accent/40 px-3 py-2 text-sm text-primary hover:bg-accent/20">Clear</button>
          </div>
        </div>
      </Card>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-primary">
          <div>{selected.size} selected</div>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-accent/40 px-2 py-1 hover:bg-accent/20">Assign</button>
            <button className="rounded-md border border-accent/40 px-2 py-1 hover:bg-accent/20">Delete</button>
            <button className="rounded-md bg-secondary px-2 py-1 text-white hover:opacity-90">Start Campaign</button>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        rows={paged}
        getRowId={getRowId}
        selectedIds={selected}
        onToggleRow={onToggleRow}
        onToggleAll={onToggleAll}
      />

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-xs text-slate-600">Page {page} of {totalPages} — {filtered.length} leads</div>
        <div className="flex items-center gap-2">
          <button disabled={page===1} onClick={() => setPage((p)=>Math.max(1,p-1))} className="rounded-md border border-accent/40 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent/20">Prev</button>
          <button disabled={page===totalPages} onClick={() => setPage((p)=>Math.min(totalPages,p+1))} className="rounded-md border border-accent/40 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent/20">Next</button>
        </div>
      </div>
    </div>
  )
}

export default Leads