import React from 'react'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-primary">
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        {children}
      </main>
    </div>
  )
}

export default PublicLayout