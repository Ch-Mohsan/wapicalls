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
  const [selectedCalls, setSelectedCalls] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { showError, showSuccess } = useToast()

  // Load calls from backend
  const loadCalls = async () => {
    try {
      setLoading(true)
      const response = await ApiClient.get(`/api/calls?page=${page}&limit=10&search=${query}&status=${status}`)
      
      // Handle different response structures
      let callsData = []
      if (response?.success && response?.data) {
        callsData = response.data
      } else if (Array.isArray(response)) {
        callsData = response
      } else if (response?.data && Array.isArray(response.data)) {
        callsData = response.data
      }
      
      setCalls(callsData)
      setTotalPages(response?.pagination?.totalPages || Math.ceil(callsData.length / 10) || 1)
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

  // Clear selection when calls change or page changes
  useEffect(() => {
    setSelectedCalls([])
  }, [page, query, status])

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

  // Bulk selection functions
  const selectedIds = new Set(selectedCalls)
  
  const handleToggleRow = (callId) => {
    setSelectedCalls(prev => 
      prev.includes(callId) 
        ? prev.filter(id => id !== callId)
        : [...prev, callId]
    )
  }

  const handleToggleAll = () => {
    if (selectedCalls.length === calls.length) {
      setSelectedCalls([])
    } else {
      setSelectedCalls(calls.map(call => call._id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCalls.length === 0) {
      showError('No calls selected for deletion')
      return
    }
    
    try {
      setLoading(true)
      const response = await ApiClient.delete('/api/calls/bulk', { callIds: selectedCalls })
      showSuccess(`Successfully deleted ${selectedCalls.length} call(s)`)
      setSelectedCalls([])
      setShowDeleteModal(false)
      await loadCalls()
    } catch (error) {
      console.error('Error deleting calls:', error)
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete selected calls'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'contact', header: 'Contact', render: (value, call) => (
      <div>
        <div className="font-medium">{call?.name || call?.contact?.name || 'Unknown'}</div>
        <div className="text-xs text-slate-600">
          {call?.phoneNumber || call?.contact?.phoneNumber || call?.phone || 'No number'}
        </div>
      </div>
    )},
    { key: 'status', header: 'Status', render: (value, call) => {
      // More comprehensive status mapping
      let status = call?.status || 'unknown'
      let displayStatus = status
      
      // Map status to more user-friendly names
      switch (status.toLowerCase()) {
        case 'initiated':
          displayStatus = 'Started'
          break
        case 'in-progress':
          displayStatus = 'In Progress'
          break
        case 'completed':
          displayStatus = 'Completed'
          break
        case 'failed':
          displayStatus = 'Failed'
          break
        case 'no-answer':
          displayStatus = 'No Answer'
          break
        case 'busy':
          displayStatus = 'Busy'
          break
        case 'queued':
          displayStatus = 'Queued'
          break
        case 'ringing':
          displayStatus = 'Ringing'
          break
        default:
          displayStatus = status.charAt(0).toUpperCase() + status.slice(1)
      }
      
      return (
        <Badge variant={getStatusVariant(call?.status)}>
          {displayStatus}
        </Badge>
      )
    }},
    { key: 'createdAt', header: 'Date', render: (value, call) => {
      // Try multiple date fields
      const date = call?.createdAt || call?.startedAt || call?.updatedAt
      
      if (!date) {
        return <div className="text-sm text-slate-500">Unknown</div>
      }
      
      try {
        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) {
          return <div className="text-sm text-slate-500">Invalid date</div>
        }
        
        return (
          <div className="text-sm">
            <div>{dateObj.toLocaleDateString()}</div>
            <div className="text-xs text-slate-600">
              {dateObj.toLocaleTimeString()}
            </div>
          </div>
        )
      } catch (error) {
        return <div className="text-sm text-slate-500">Invalid date</div>
      }
    }},
    { key: 'transcript', header: 'Transcript', render: (value, call) => {
      // Handle different transcript formats
      let transcriptText = null
      
      if (call?.transcript) {
        if (typeof call.transcript === 'string') {
          transcriptText = call.transcript.trim()
        } else if (typeof call.transcript === 'object') {
          // Handle object format transcript
          transcriptText = call.transcript.text || call.transcript.content || JSON.stringify(call.transcript)
        }
      }
      
      // Check call status to provide better feedback
      const getTranscriptDisplay = () => {
        if (transcriptText && transcriptText.length > 0) {
          return (
            <div className="text-sm text-slate-600 truncate" title={transcriptText}>
              {transcriptText.substring(0, 50)}
              {transcriptText.length > 50 && '...'}
            </div>
          )
        } else if (call?.status === 'in-progress' || call?.status === 'ringing') {
          return <span className="text-xs text-slate-400">Call in progress</span>
        } else if (call?.status === 'failed' || call?.status === 'no-answer' || call?.status === 'busy') {
          return <span className="text-xs text-slate-400">Call not connected</span>
        } else {
          return <span className="text-xs text-slate-400">No transcript</span>
        }
      }
      
      return (
        <div className="max-w-xs">
          {getTranscriptDisplay()}
        </div>
      )
    }}
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
      const response = await ApiClient.post(`/api/calls/${call._id}/refresh`)
      
      if (response.success) {
        showSuccess('Call details refreshed successfully!')
        // Reload calls to show updated data
        loadCalls()
        // Update the selected call if modal is open
        if (showCallModal && selectedCall?._id === call._id) {
          setSelectedCall(response.data)
        }
      } else {
        showError(response.message || 'Failed to refresh call details')
      }
    } catch (error) {
      console.error('Error refreshing call:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to refresh call details'
      showError(errorMessage)
    }
  }

  const renderActions = (call) => (
    <div className="flex items-center justify-center">
      <button 
        onClick={() => handleViewCall(call)}
        className="rounded-md border border-accent/40 px-3 py-1.5 text-xs text-primary hover:bg-accent/20 transition-colors"
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
      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search by name or phone number" 
              className="w-full rounded-md border border-accent/40 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-all" 
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status Filter</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className="w-full rounded-md border border-accent/40 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-all"
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="text-center">
          <div className="text-xl md:text-2xl font-semibold text-primary">
            {calls.filter(c => c.status === 'completed' || c.status === 'ended').length}
          </div>
          <div className="text-xs md:text-sm text-slate-600">Completed Calls</div>
        </Card>
        <Card className="text-center">
          <div className="text-xl md:text-2xl font-semibold text-secondary">
            {calls.filter(c => c.status === 'failed' || c.status === 'no-answer').length}
          </div>
          <div className="text-xs md:text-sm text-slate-600">Failed Calls</div>
        </Card>
        <Card className="text-center">
          <div className="text-xl md:text-2xl font-semibold text-accent">
            {calls.filter(c => c.status === 'in-progress' || c.status === 'ringing').length}
          </div>
          <div className="text-xs md:text-sm text-slate-600">Active Calls</div>
        </Card>
        <Card className="text-center">
          <div className="text-xl md:text-2xl font-semibold text-primary">
            {calls.length}
          </div>
          <div className="text-xs md:text-sm text-slate-600">Total Calls</div>
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
            {/* Bulk Actions Bar */}
            {selectedCalls.length > 0 && (
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-blue-50 p-3 border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedCalls.length} call{selectedCalls.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedCalls([])}
                    className="flex-1 sm:flex-none rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={loading}
                    className="flex-1 sm:flex-none rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}
            
            <Table
              columns={columns}
              rows={calls}
              getRowId={(call) => call._id}
              selectedIds={selectedIds}
              onToggleRow={handleToggleRow}
              onToggleAll={handleToggleAll}
              renderActions={renderActions}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-accent/20 pt-4 sm:flex-row sm:gap-0">
                <div className="text-sm text-slate-600 order-2 sm:order-1">
                  Page {page} of {totalPages} ({calls.length} calls)
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-accent/40 px-4 py-2 text-sm text-primary hover:bg-accent/20 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Previous
                  </button>
                  <span className="hidden sm:inline text-sm text-slate-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-md border border-accent/40 px-4 py-2 text-sm text-primary hover:bg-accent/20 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Bulk Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Delete Selected Calls"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-700">
            Are you sure you want to delete <strong>{selectedCalls.length}</strong> selected call{selectedCalls.length !== 1 ? 's' : ''}? 
            This action cannot be undone.
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete Calls'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Call Details Modal */}
      <Modal 
        isOpen={showCallModal} 
        onClose={() => setShowCallModal(false)}
        title={`Call Details - ${selectedCall?.status || 'Unknown'}`}
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4 sm:space-y-6">
          {selectedCall && (
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Information</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contact Name</label>
                    <div className="text-sm font-medium text-slate-900 break-words">
                      {selectedCall.name || selectedCall.contact?.name || 'Unknown'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                    <div className="text-sm text-slate-900 font-mono break-all">
                      {selectedCall.phoneNumber || selectedCall.contact?.phoneNumber || selectedCall.phone || 'No number'}
                    </div>
                  </div>
                  
                  {selectedCall.contact?.email && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                      <div className="text-sm text-slate-900 break-words">
                        {selectedCall.contact.email}
                      </div>
                    </div>
                  )}
                  
                  {selectedCall.contact?.company && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Company</label>
                      <div className="text-sm text-slate-900 break-words">
                        {selectedCall.contact.company}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Information */}
              <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Call Information</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Conversation Transcript</h3>
                <div className="bg-white rounded-md p-3 sm:p-4 max-h-48 sm:max-h-60 overflow-y-auto border">
                  {(() => {
                    let transcriptText = null
                    
                    if (selectedCall.transcript) {
                      if (typeof selectedCall.transcript === 'string') {
                        transcriptText = selectedCall.transcript
                      } else if (typeof selectedCall.transcript === 'object') {
                        // Handle object format transcript
                        transcriptText = selectedCall.transcript.text || 
                                       selectedCall.transcript.content || 
                                       JSON.stringify(selectedCall.transcript, null, 2)
                      }
                    }
                    
                    return transcriptText ? (
                      <div className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed break-words">
                        {transcriptText}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 italic text-center py-4">
                        No transcript available for this call
                      </div>
                    )
                  })()}
                </div>
              </div>
              
              {/* Technical Details */}
              <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Technical Details</h3>
                <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">VAPI Call ID</label>
                    <div className="text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded border break-all">
                      {selectedCall.vapiCallId || 'Not available'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Database ID</label>
                    <div className="text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded border break-all">
                      {selectedCall._id}
                    </div>
                  </div>
                  
                  {selectedCall.recordingUrl && (
                    <div className="sm:col-span-1 lg:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Recording</label>
                      <a 
                        href={selectedCall.recordingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline break-words"
                      >
                        Listen to Recording
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Follow-up and Notes */}
              {(selectedCall.followUpRequired || selectedCall.tags?.length > 0) && (
                <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
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
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default CallHistory
