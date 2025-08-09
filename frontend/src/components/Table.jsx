import React from 'react'

export function Table({ columns, rows, getRowId, selectedIds = new Set(), onToggleRow, onToggleAll }) {
  const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(getRowId(r)))

  return (
    <div className="overflow-hidden rounded-lg border border-accent/40 bg-white/80 shadow-sm">
      <table className="w-full table-fixed">
        <thead className="bg-accent/10">
          <tr>
            <th className="w-10 px-3 py-2 text-left">
              <input type="checkbox" checked={allSelected} onChange={onToggleAll} />
            </th>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 text-left text-sm font-semibold text-primary truncate">{col.header}</th>
            ))}
            <th className="w-12 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = getRowId(row)
            const selected = selectedIds.has(id)
            return (
              <tr key={id} className="border-t border-accent/20 hover:bg-accent/10">
                <td className="px-3 py-2"><input type="checkbox" checked={selected} onChange={() => onToggleRow(id)} /></td>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 text-sm text-primary truncate">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                ))}
                <td className="px-3 py-2 text-right">
                  <button className="rounded-md border border-accent/40 px-2 py-1 text-xs text-primary hover:bg-accent/20">View</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}