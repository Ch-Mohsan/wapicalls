import React from 'react'

export function Table({ columns, rows, getRowId, selectedIds = new Set(), onToggleRow, onToggleAll, renderActions }) {
  const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(getRowId(r)))

  return (
    <div className="overflow-hidden rounded-lg border border-accent/40 bg-white/80 shadow-sm">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto min-w-full">
          <thead className="bg-accent/10">
            <tr>
              <th className="w-10 px-3 py-3 text-left">
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  onChange={onToggleAll}
                  className="rounded border-accent/40"
                />
              </th>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">
                  {col.header}
                </th>
              ))}
              {renderActions && <th className="w-20 px-3 py-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = getRowId(row)
              const selected = selectedIds.has(id)
              return (
                <tr key={id} className="border-t border-accent/20 hover:bg-accent/10 transition-colors">
                  <td className="px-3 py-3">
                    <input 
                      type="checkbox" 
                      checked={selected} 
                      onChange={() => onToggleRow(id)}
                      className="rounded border-accent/40"
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-3 text-sm text-primary">
                      <div className="max-w-xs truncate">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </div>
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-3 py-3 text-center">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-3">
        {rows.length > 0 && (
          <div className="flex items-center justify-between pb-3 border-b border-accent/20">
            <label className="flex items-center gap-2 text-sm text-primary">
              <input 
                type="checkbox" 
                checked={allSelected} 
                onChange={onToggleAll}
                className="rounded border-accent/40"
              />
              Select All
            </label>
          </div>
        )}
        
        {rows.map((row) => {
          const id = getRowId(row)
          const selected = selectedIds.has(id)
          return (
            <div 
              key={id} 
              className={`border border-accent/40 rounded-lg p-4 space-y-3 transition-colors ${
                selected ? 'bg-accent/10 border-accent/60' : 'bg-white hover:bg-accent/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <input 
                  type="checkbox" 
                  checked={selected} 
                  onChange={() => onToggleRow(id)}
                  className="rounded border-accent/40"
                />
                {renderActions ? renderActions(row) : (
                  <button className="rounded-md border border-accent/40 px-3 py-1 text-xs text-primary hover:bg-accent/20 transition-colors">
                    View
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      {col.header}:
                    </span>
                    <span className="text-sm text-primary mt-1 sm:mt-0 break-words">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {rows.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <div className="text-sm">No leads found</div>
          <div className="text-xs mt-1">Try adjusting your filters or add some leads</div>
        </div>
      )}
    </div>
  )
}