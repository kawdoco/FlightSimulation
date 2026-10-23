import ErrorBoundary from './ErrorBoundary.jsx'
import AuthGate from './AuthGate.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary><AuthGate><App /></AuthGate></ErrorBoundary>
  </StrictMode>,
)


