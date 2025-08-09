import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './store/AuthContext.jsx'
import { LeadsProvider } from './store/LeadsContext.jsx'
import { UIProvider } from './store/UIContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UIProvider>
      <AuthProvider>
        <LeadsProvider>
          <App />
        </LeadsProvider>
      </AuthProvider>
    </UIProvider>
  </StrictMode>,
)
