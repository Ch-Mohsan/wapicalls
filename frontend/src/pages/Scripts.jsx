import React, { useState, useEffect } from 'react'
import Card from '../components/Card.jsx'
import Modal from '../components/Modal.jsx'
import { useScripts } from '../store/ScriptsContext.jsx'
import { useToast } from '../store/ToastContext.jsx'

function ScriptForm({ initial, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [systemMessage, setSystemMessage] = useState(initial?.systemMessage || '')
  const [content, setContent] = useState(initial?.content || '')
  const [isDefault, setIsDefault] = useState(!!initial?.isDefault)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ title, systemMessage, content, isDefault })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-primary">Title</label>
        <input className="mt-1 w-full rounded-md border border-accent/40 px-3 py-2 text-sm" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Script title" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary">System Message</label>
        <textarea className="mt-1 w-full rounded-md border border-accent/40 px-3 py-2 text-sm h-36" value={systemMessage} onChange={e=>setSystemMessage(e.target.value)} placeholder="Describe assistant persona, goals, guardrails" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary">Optional Content/Notes</label>
        <textarea className="mt-1 w-full rounded-md border border-accent/40 px-3 py-2 text-sm h-28" value={content} onChange={e=>setContent(e.target.value)} placeholder="Extra responses, checklist, objection handling" />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isDefault} onChange={e=>setIsDefault(e.target.checked)} />
        Make default for new calls
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-md border border-accent/40 px-3 py-2 text-sm">Cancel</button>
        <button disabled={loading} className="rounded-md bg-secondary px-3 py-2 text-sm text-white disabled:opacity-60">{loading? 'Saving...' : 'Save Script'}</button>
      </div>
    </form>
  )
}

function Scripts() {
  const { scripts, loading, error, create, update, remove, duplicate, selectedScriptId, setSelectedScriptId } = useScripts()
  const { showSuccess, showError } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)

  useEffect(() => {
    const onDocClick = () => setOpenMenuId(null)
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handleNew = () => { setEditing(null); setShowModal(true) }
  const handleEdit = (s) => { setEditing(s); setShowModal(true) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await update(editing._id, data)
        showSuccess('Script updated')
      } else {
        await create(data)
        showSuccess('Script created')
      }
      setShowModal(false)
    } catch (e) {
      console.error(e)
      showError(e.message || 'Failed to save script')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (s) => {
    try {
      await remove(s._id)
      showSuccess('Script deleted')
    } catch (e) {
      showError(e.message || 'Failed to delete')
    }
  }

  const onDuplicate = async (s) => {
    try {
      const copy = await duplicate(s._id)
      showSuccess('Script duplicated')
    } catch (e) { showError(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Scripts</h1>
          <p className="text-sm text-slate-600">Create and manage call scripts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedScriptId(null)} className="rounded-md border border-accent/40 bg-white px-3 py-2 text-sm text-primary hover:bg-accent/20">Clear selection</button>
          <button onClick={handleNew} className="rounded-md bg-secondary px-3 py-2 text-sm text-white hover:opacity-90">New Script</button>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error.message || 'Failed to load scripts'}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(scripts || []).map((s) => (
          <div key={s._id} className="relative">
            <Card 
              title={
                <div className="flex items-start justify-between gap-2">
                  <div className="pr-8">
                    <div className="text-xl font-semibold tracking-tight text-primary break-words leading-snug">{s.title}</div>
                    <div className="text-xs text-slate-500 mt-1">Updated {new Date(s.updatedAt).toISOString().slice(0,10)}</div>
                  </div>
                  <div className="absolute right-3 top-3">
                    <div className="relative">
                      <button 
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent/30 text-slate-600"
                        aria-label="Open menu"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === s._id}
                        onClick={(e)=>{ e.stopPropagation(); setOpenMenuId((prev)=> prev===s._id ? null : s._id) }}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/></svg>
                      </button>
                      <div 
                        onClick={(e)=> e.stopPropagation()}
                        className={`absolute right-0 z-10 mt-1 w-36 rounded-md border border-accent/40 bg-white shadow-md transition-opacity ${openMenuId===s._id ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'}`}
                        role="menu"
                      >
                        <button onClick={() => { setOpenMenuId(null); handleEdit(s) }} className="block w-full px-3 py-2 text-left text-sm hover:bg-accent/20" role="menuitem">Edit</button>
                        <button onClick={() => { setOpenMenuId(null); onDuplicate(s) }} className="block w-full px-3 py-2 text-left text-sm hover:bg-accent/20" role="menuitem">Duplicate</button>
                        <button onClick={() => { setOpenMenuId(null); onDelete(s) }} className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" role="menuitem">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>Usage: <span className="font-medium text-primary">{s.usageCount || 0}</span></div>
                <label className="inline-flex items-center gap-2 select-none">
                  <input 
                    type="checkbox"
                    checked={selectedScriptId === s._id}
                    onChange={(e)=> setSelectedScriptId(e.target.checked ? s._id : null)}
                  />
                  Use for new calls
                </label>
              </div>
              <div className="mt-3 rounded-md border border-accent/40 bg-white p-3 text-xs text-slate-600 max-h-36 overflow-auto">
                <div className="mb-2 font-semibold text-primary">System Message</div>
                <p className="whitespace-pre-wrap">{s.systemMessage}</p>
              </div>
            </Card>
          </div>
        ))}
        {(!loading && scripts?.length === 0) && (
          <div className="col-span-full text-sm text-slate-600">No scripts yet. Create your first script.</div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title={editing ? 'Edit Script' : 'New Script'}>
        <ScriptForm initial={editing} onSubmit={onSubmit} onCancel={()=>setShowModal(false)} loading={saving} />
      </Modal>
    </div>
  )
}

export default Scripts