import React, { useMemo, useState, useEffect } from 'react'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import Modal from '../components/Modal.jsx'
import NewLeadForm from '../components/NewLeadForm.jsx'
import CSVUpload from '../components/CSVUpload.jsx'
import { Table } from '../components/Table.jsx'
import { useLeads } from '../store/LeadsContext.jsx'
import { useToast } from '../store/ToastContext.jsx'
import { ApiClient } from '../store/apiClient.js'

function Leads() {
  const { leads, loading, error, createLead, bulkImportLeads, deleteLead } = useLeads()
  const { showSuccess, showError, showWarning } = useToast()
  
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [page, setPage] = useState(1)
  const [showNewLeadModal, setShowNewLeadModal] = useState(false)
  const [showCSVModal, setShowCSVModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [callStates, setCallStates] = useState({}) // Track call states for each lead
  const pageSize = 8

  const filtered = useMemo(() => {
    return leads.filter((l) =>
      (!query || (l.name || '').toLowerCase().includes(query.toLowerCase()) || (l.email || '').includes(query)) &&
      (!status || l.status === status)
    )
  }, [query, status, leads])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Make call to a specific lead
  const handleMakeCall = async (lead) => {
    if (!lead.phone) {
      showError('No phone number available for this lead')
      return
    }

    const leadId = lead.id
    setCallStates(prev => ({ ...prev, [leadId]: 'ringing' }))

    try {
      showSuccess(`Initiating call to ${lead.name || lead.phone}...`)
      
      const response = await ApiClient.post('/api/calls', {
        contactId: leadId,
        phoneNumber: lead.phone,
        name: lead.name || 'Unknown'
      })

      if (response.vapiCallId) {
        setCallStates(prev => ({ ...prev, [leadId]: 'in-process' }))
        showSuccess(`Call connected to ${lead.name || lead.phone}`)
        
        // Poll for call status updates
        pollCallStatus(response.vapiCallId, leadId)
      }
    } catch (error) {
      console.error('Error making call:', error)
      setCallStates(prev => ({ ...prev, [leadId]: 'failed' }))
      showError(`Failed to initiate call: ${error.response?.data?.error || error.message}`)
    }
  }

  // Poll call status from backend
  const pollCallStatus = async (vapiCallId, leadId) => {
    let attempts = 0
    const maxAttempts = 60 // Poll for 5 minutes (every 5 seconds)
    
    const poll = async () => {
      try {
        const response = await ApiClient.get(`/api/calls/${vapiCallId}`)
        const call = response
        
        if (call.status && ['completed', 'ended', 'failed', 'no-answer', 'busy'].includes(call.status.toLowerCase())) {
          setCallStates(prev => ({ ...prev, [leadId]: 'ended' }))
          showSuccess(`Call ended. Status: ${call.status}`)
          if (call.transcript) {
            console.log('Call transcript:', call.transcript)
          }
          return
        }
        
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          setCallStates(prev => ({ ...prev, [leadId]: 'ended' }))
          showWarning('Call status polling timed out')
        }
      } catch (error) {
        console.error('Error polling call status:', error)
        setCallStates(prev => ({ ...prev, [leadId]: 'ended' }))
      }
    }
    
    setTimeout(poll, 5000) // Start polling after 5 seconds
  }

  const getCallStatusBadge = (leadId) => {
    const state = callStates[leadId]
    if (!state) return null
    
    const variants = {
      ringing: 'warning',
      'in-process': 'info', 
      ended: 'success',
      failed: 'danger'
    }
    
    return <Badge variant={variants[state] || 'default'}>{state}</Badge>
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', render: (value) => {
      const variant = value === 'Qualified' ? 'success' : value === 'Contacted' ? 'info' : value === 'Lost' ? 'danger' : 'default'
      return <Badge variant={variant}>{value}</Badge>
    } },
    { key: 'score', header: 'Score' },
    { key: 'createdAt', header: 'Created' }
  ]

  const renderActions = (row) => (
    <div className="flex items-center gap-2">
      {getCallStatusBadge(row.id)}
      <button
        onClick={() => handleMakeCall(row)}
        disabled={callStates[row.id] && callStates[row.id] !== 'ended' && callStates[row.id] !== 'failed'}
        className="flex items-center gap-1 rounded-md border border-green-400 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title={`Call ${row.name || row.phone}`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
        {callStates[row.id] === 'ringing' ? 'Ringing...' : 
         callStates[row.id] === 'in-process' ? 'In Call...' :
         'Call'}
      </button>
    </div>
  )

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

  const handleCreateLead = async (leadData) => {
    setActionLoading(true)
    try {
      await createLead(leadData)
      showSuccess('Lead created successfully!')
      // Success handled by form via onSuccess callback
    } catch (error) {
      console.error('Error creating lead:', error)
      // Rethrow to let form handle the error display
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleCSVUpload = async (csvData) => {
    setActionLoading(true)
    try {
      await bulkImportLeads(csvData)
      setShowCSVModal(false)
      showSuccess(`Successfully imported ${csvData.length} leads!`)
    } catch (error) {
      console.error('Error uploading CSV:', error)
      showError('Failed to import leads: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return
    
    setActionLoading(true)
    try {
      let deletedCount = 0
      for (const id of selected) {
        await deleteLead(id)
        deletedCount++
      }
      setSelected(new Set())
      showSuccess(`Successfully deleted ${deletedCount} lead(s)!`)
    } catch (error) {
      console.error('Error deleting leads:', error)
      showError('Failed to delete leads: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Add Start Campaign functionality
  const handleStartCampaign = async () => {
    showWarning('Campaign functionality is not available yet. Use the Call button to make individual calls.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Leads</h1>
          <p className="text-sm text-slate-600">Manage and import leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCSVModal(true)}
            className="rounded-md border border-accent/40 bg-white px-3 py-2 text-sm text-primary hover:bg-accent/20 disabled:opacity-50"
            disabled={loading || actionLoading}
          >
            Import CSV
          </button>
          <button 
            onClick={() => setShowNewLeadModal(true)}
            className="rounded-md bg-secondary px-3 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            disabled={loading || actionLoading}
          >
            New Lead
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-600">Search</label>
            <div className="flex items-center gap-2">
              <input 
                value={query} 
                onChange={(e) => { setQuery(e.target.value); setPage(1) }} 
                placeholder="Search by name or email" 
                className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" 
                disabled={loading}
              />
            </div>
          </div>
          <div className="w-full md:w-60">
            <label className="mb-1 block text-xs text-slate-600">Status</label>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1) }} 
              className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              disabled={loading}
            >
              <option value="">All</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Qualified</option>
              <option>Lost</option>
            </select>
          </div>
          <div className="self-end md:self-auto">
            <button 
              onClick={clearFilters} 
              className="rounded-md border border-accent/40 px-3 py-2 text-sm text-primary hover:bg-accent/20 disabled:opacity-50"
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>
      </Card>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-primary">
          <div>{selected.size} selected</div>
          <div className="flex items-center gap-2">
            <button 
              className="rounded-md border border-accent/40 px-2 py-1 hover:bg-accent/20 disabled:opacity-50"
              disabled={actionLoading}
            >
              Assign
            </button>
            <button 
              onClick={handleDeleteSelected}
              className="rounded-md border border-red-400 px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </button>
            <button 
              onClick={handleStartCampaign}
              className="rounded-md bg-secondary px-2 py-1 text-white hover:opacity-90 disabled:opacity-50"
              disabled={actionLoading}
            >
              Start Campaign
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-slate-600">Loading leads...</div>
          </div>
        </Card>
      ) : (
        <Table
          columns={columns}
          rows={paged}
          getRowId={getRowId}
          selectedIds={selected}
          onToggleRow={onToggleRow}
          onToggleAll={onToggleAll}
          renderActions={renderActions}
        />
      )}

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-xs text-slate-600">
          Page {page} of {totalPages} — {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1 || loading} 
            onClick={() => setPage((p) => Math.max(1, p - 1))} 
            className="rounded-md border border-accent/40 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent/20"
          >
            Prev
          </button>
          <button 
            disabled={page === totalPages || loading} 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
            className="rounded-md border border-accent/40 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent/20"
          >
            Next
          </button>
        </div>
      </div>

      {/* New Lead Modal */}
      <Modal
        isOpen={showNewLeadModal}
        onClose={() => setShowNewLeadModal(false)}
        title="Add New Lead"
        maxWidth="max-w-lg"
      >
        <NewLeadForm
          onSubmit={handleCreateLead}
          onCancel={() => setShowNewLeadModal(false)}
          onSuccess={() => setShowNewLeadModal(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        title="Import Leads from CSV"
        maxWidth="max-w-2xl"
      >
        <CSVUpload
          onUpload={handleCSVUpload}
          onCancel={() => setShowCSVModal(false)}
          loading={actionLoading}
        />
      </Modal>
    </div>
  )
}

export default Leads