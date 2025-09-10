import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './store/AuthContext.jsx'
import { LeadsProvider } from './store/LeadsContext.jsx'
import { UIProvider } from './store/UIContext.jsx'
import { ToastProvider } from './store/ToastContext.jsx'
import { CampaignsProvider } from './store/CampaignsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <UIProvider>
        <AuthProvider>
          <LeadsProvider>
            <CampaignsProvider>
              <App />
            </CampaignsProvider>
          </LeadsProvider>
        </AuthProvider>
      </UIProvider>
    </ToastProvider>
  </StrictMode>,
)
