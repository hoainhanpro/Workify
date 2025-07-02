import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import { StagewiseToolbar } from '@stagewise/toolbar-react'

// Render main app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Initialize stagewise toolbar separately (best practice from documentation)
document.addEventListener('DOMContentLoaded', () => {
  const toolbarRoot = document.createElement('div')
  toolbarRoot.id = 'stagewise-toolbar-root'
  document.body.appendChild(toolbarRoot)

  ReactDOM.createRoot(toolbarRoot).render(
    <React.StrictMode>
      <StagewiseToolbar />
    </React.StrictMode>
  )
}) 