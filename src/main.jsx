import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './api' // Load Axios interceptor
import App from './App.jsx'
import AppProvider from './Context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
 <AppProvider>
    <App />
 </AppProvider>
  )