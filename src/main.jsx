import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Entry point for the CBT Practice System
 * Renders the main App component into the DOM
 * Note: StrictMode temporarily disabled to fix Supabase AbortError
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
