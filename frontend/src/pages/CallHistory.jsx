import React, { useState, useEffect } from 'react'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import Modal from '../components/Modal.jsx'
import { Table } from '../components/Table.jsx'
import { ApiClient } from '../store/apiClient.js'
import { useToast } from '../store/ToastContext.jsx'

function CallHistory() {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCall, setSelectedCall] = useState(null)
  const [showCallModal, setShowCallModal] = useState(false)
  const { showError, showSuccess } = useToast()

  // Load calls from backend
  const loadCalls = async () => {
    try {
      setLoading(true)
      const response = await ApiClient.get(`/api/calls?page=${page}&limit=10&search=${query}&status=${status}`)
      
      if (response.success) {
        setCalls(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        setCalls([])
      }
    } catch (error) {
      console.error('Error loading calls:', error)
      showError('Failed to load call history')
      setCalls([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCalls()
  }, [page, query, status])

  // Format call duration
  const formatDuration = (duration) => {
    if (!duration) return 'N/A'
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'ended':
        return 'success'
      case 'failed':
      case 'no-answer':
      case 'busy':
        return 'error'
      case 'in-progress':
      case 'ringing':
        return 'warning'
      default:
        return 'default'
    }
  }

  const columns = [
    { key: 'contact', header: 'Contact', render: (call) => (
      <div>
        <div className="font-medium">{call?.name || call?.contact?.name || 'Unknown'}</div>
        <div className="text-xs text-slate-600">{call?.phoneNumber || 'No number'}</div>
      </div>
    )},
    { key: 'status', header: 'Status', render: (call) => (
      <Badge variant={getStatusVariant(call?.status)}>
        {call?.status || 'Unknown'}
      </Badge>
    )},
    { key: 'duration', header: 'Duration', render: (call) => (
      <span className="text-sm">{formatDuration(call?.duration)}</span>
    )},
    { key: 'createdAt', header: 'Date', render: (call) => (
      <div className="text-sm">
        <div>{call?.createdAt ? new Date(call.createdAt).toLocaleDateString() : 'Unknown'}</div>
        <div className="text-xs text-slate-600">
          {call?.createdAt ? new Date(call.createdAt).toLocaleTimeString() : ''}
        </div>
      </div>
    )},
    { key: 'transcript', header: 'Transcript', render: (call) => (
      <div className="max-w-xs">
        {call && call.transcript ? (
          <div className="text-sm text-slate-600 truncate" title={call.transcript}>
            {call.transcript.substring(0, 100)}
            {call.transcript.length > 100 && '...'}
          </div>
        ) : (
          <span className="text-xs text-slate-400">No transcript</span>
        )}
      </div>
    )}
  ]

  const handleViewCall = (call) => {
    console.log('🔍 ViewCall clicked:', call)
    console.log('🔍 Setting selectedCall and showing modal')
    setSelectedCall(call)
    setShowCallModal(true)
    console.log('🔍 Modal should now be visible')
  }

  const handleRefreshCall = async (call) => {
    try {
      showSuccess('Refreshing call details from VAPI...')
      await ApiClient.post(`/api/calls/${call._id}/refresh`)
      showSuccess('Call details refreshed successfully!')
      // Reload calls to show updated data
      loadCalls()
      // Update the selected call if modal is open
      if (showCallModal && selectedCall?._id === call._id) {
        const updatedCalls = await ApiClient.get(`/api/calls?page=1&limit=100`)
        const updatedCall = updatedCalls.data.find(c => c._id === call._id)
        if (updatedCall) {
          setSelectedCall(updatedCall)
        }
      }
    } catch (error) {
      console.error('Error refreshing call:', error)
      showError('Failed to refresh call details')
    }
  }

  const renderActions = (call) => (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => handleViewCall(call)}
        className="rounded-md border border-accent/40 px-3 py-1 text-xs text-primary hover:bg-accent/20"
      >
        View Details
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Call History</h1>
          <p className="text-sm text-slate-600">Track your call performance and responses</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadCalls}
            className="rounded-md bg-secondary px-3 py-2 text-sm text-white hover:opacity-90"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-slate-600">Search</label>
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search by name or phone number" 
              className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className="w-full rounded-md border border-accent/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="ended">Ended</option>
              <option value="failed">Failed</option>
              <option value="no-answer">No Answer</option>
              <option value="busy">Busy</option>
              <option value="in-progress">In Progress</option>
              <option value="ringing">Ringing</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Call Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="text-2xl font-semibold text-primary">
            {calls.filter(c => c.status === 'completed' || c.status === 'ended').length}
          </div>
          <div className="text-sm text-slate-600">Completed Calls</div>
        </Card>
        <Card>
          <div className="text-2xl font-semibold text-secondary">
            {calls.filter(c => c.status === 'failed' || c.status === 'no-answer').length}
          </div>
          <div className="text-sm text-slate-600">Failed Calls</div>
        </Card>
        <Card>
          <div className="text-2xl font-semibold text-accent">
            {calls.filter(c => c.status === 'in-progress' || c.status === 'ringing').length}
          </div>
          <div className="text-sm text-slate-600">Active Calls</div>
        </Card>
        <Card>
          <div className="text-2xl font-semibold text-primary">
            {calls.length}
          </div>
          <div className="text-sm text-slate-600">Total Calls</div>
        </Card>
      </div>

      {/* Calls Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-slate-600">Loading call history...</div>
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-600">
              No calls found. Start making calls from the Leads page!
            </div>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              rows={calls}
              getRowId={(call) => call._id}
              renderActions={renderActions}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-accent/20 pt-4">
                <div className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-accent/40 px-3 py-1 text-sm text-primary hover:bg-accent/20 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-md border border-accent/40 px-3 py-1 text-sm text-primary hover:bg-accent/20 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Enhanced Call Details Modal */}
      <Modal 
        isOpen={showCallModal} 
        onClose={() => setShowCallModal(false)}
        title={`Call Details - ${selectedCall?.status || 'Unknown'}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {selectedCall && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Information</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contact Name</label>
                    <div className="text-sm font-medium text-slate-900">
                      {selectedCall.name || selectedCall.contact?.name || 'Unknown'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                    <div className="text-sm text-slate-900 font-mono">
                      {selectedCall.phoneNumber || 'No number'}
                    </div>
                  </div>
                  
                  {selectedCall.contact?.email && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                      <div className="text-sm text-slate-900">
                        {selectedCall.contact.email}
                      </div>
                    </div>
                  )}
                  
                  {selectedCall.contact?.company && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Company</label>
                      <div className="text-sm text-slate-900">
                        {selectedCall.contact.company}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Call Information</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                    <Badge variant={getStatusVariant(selectedCall?.status)}>
                      {selectedCall?.status || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                    <div className="text-sm text-slate-900">
                      {formatDuration(selectedCall.duration)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">End Reason</label>
                    <div className="text-sm text-slate-900">
                      {selectedCall.endReason || 'Not specified'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Call Started</label>
                    <div className="text-sm text-slate-900">
                      {selectedCall.startedAt ? (
                        <>
                          <div>{new Date(selectedCall.startedAt).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-600">{new Date(selectedCall.startedAt).toLocaleTimeString()}</div>
                        </>
                      ) : (
                        new Date(selectedCall.createdAt).toLocaleDateString() + ' ' + 
                        new Date(selectedCall.createdAt).toLocaleTimeString()
                      )}
                    </div>
                  </div>
                  
                  {selectedCall.endedAt && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Call Ended</label>
                      <div className="text-sm text-slate-900">
                        <div>{new Date(selectedCall.endedAt).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-600">{new Date(selectedCall.endedAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedCall.cost && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Cost</label>
                      <div className="text-sm text-slate-900">
                        ${selectedCall.cost}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Conversation Transcript */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Conversation Transcript</h3>
                <div className="bg-white rounded-md p-4 max-h-60 overflow-y-auto border">
                  {selectedCall.transcript ? (
                    <div className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {selectedCall.transcript}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic text-center py-4">
                      No transcript available for this call
                    </div>
                  )}
                </div>
              </div>
              
              {/* Technical Details */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Technical Details</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">VAPI Call ID</label>
                    <div className="text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded border">
                      {selectedCall.vapiCallId || 'Not available'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Database ID</label>
                    <div className="text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded border">
                      {selectedCall._id}
                    </div>
                  </div>
                  
                  {selectedCall.recordingUrl && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Recording</label>
                      <a 
                        href={selectedCall.recordingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Listen to Recording
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Follow-up and Notes */}
              {(selectedCall.followUpRequired || selectedCall.tags?.length > 0) && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Follow-up & Notes</h3>
                  
                  {selectedCall.followUpRequired && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Follow-up Required</label>
                      <div className="text-sm text-orange-600 font-medium">
                        Yes {selectedCall.followUpDate && `- by ${new Date(selectedCall.followUpDate).toLocaleDateString()}`}
                      </div>
                    </div>
                  )}
                  
                  {selectedCall.tags && selectedCall.tags.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedCall.tags.map((tag, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                {selectedCall?.vapiCallId && (
                  <button 
                    onClick={() => handleRefreshCall(selectedCall)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Refresh from VAPI
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default CallHistory
