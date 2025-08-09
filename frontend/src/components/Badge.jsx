import React from 'react'

const VARIANT_TO_CLASS = {
  default: 'bg-accent/30 text-primary border border-accent/50',
  success: 'bg-green-100 text-green-800 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  danger: 'bg-red-100 text-red-800 border border-red-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
}

function Badge({ children, variant = 'default', className = '' }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  const cls = [base, VARIANT_TO_CLASS[variant] || VARIANT_TO_CLASS.default, className].join(' ')
  return <span className={cls}>{children}</span>
}

export default Badge