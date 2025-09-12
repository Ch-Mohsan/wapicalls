import React from 'react'
import { motion } from 'framer-motion'

function Card({ title, subtitle, actions, children, className = '', clickable = false, onClick }) {
  const CardComponent = clickable ? motion.div : motion.div
  
  return (
    <CardComponent 
      whileHover={clickable ? { 
        scale: 1.02, 
        y: -2,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      } : {
        boxShadow: "0 4px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
      whileTap={clickable ? { scale: 0.98 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      onClick={clickable ? onClick : undefined}
      className={[
        "rounded-lg border border-secondary/40 bg-white/80 shadow-sm",
        clickable ? "cursor-pointer" : "",
        className
      ].join(' ')}
    >
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
    </CardComponent>
  )
}

export default Card