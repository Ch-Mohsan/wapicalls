import React from 'react'

function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <div className={["rounded-lg border border-secondary/40 bg-white/80 shadow-sm", className].join(' ')}>
      {(title || actions || subtitle) && (
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            {title && <div className="text-xl font-semibold tracking-tight text-primary">{title}</div>}
            {subtitle && <div className="text-sm text-slate-600 mt-1">{subtitle}</div>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5 pt-0">
        {children}
      </div>
    </div>
  )
}

export default Card