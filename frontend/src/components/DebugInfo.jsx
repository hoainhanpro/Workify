import React, { useState, useEffect } from 'react'
import taskService from '../services/taskService'

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({
    token: null,
    apiUrl: null,
    connectionStatus: 'checking...',
    lastError: null
  })

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check token
        const token = localStorage.getItem('workify_access_token')
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          token: token ? `${token.substring(0, 20)}...` : 'No token',
          apiUrl: 'http://localhost:8080/api'
        }))

        // Test API connection
        const response = await fetch('http://localhost:8080/api/tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : null,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: `✅ Connected - ${data.count || 0} tasks`,
            lastError: null
          }))
        } else {
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: `❌ HTTP ${response.status}`,
            lastError: `Status: ${response.status} ${response.statusText}`
          }))
        }
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: '❌ Connection failed',
          lastError: error.message
        }))
      }
    }

    checkConnection()
  }, [])

  const testTaskService = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, connectionStatus: 'Testing...' }))
      
      const response = await taskService.getAllTasks()
      console.log('Test response:', response)
      
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: '✅ TaskService working',
        lastError: null
      }))
    } catch (error) {
      console.error('Test error:', error)
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: '❌ TaskService failed',
        lastError: error.message
      }))
    }
  }

  return (
    <div className="card mt-3">
      <div className="card-header">
        <h6 className="mb-0">🔧 Debug Information</h6>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <strong>Authentication Token:</strong>
            <br />
            <small className="text-muted">{debugInfo.token}</small>
          </div>
          <div className="col-md-6">
            <strong>API URL:</strong>
            <br />
            <small className="text-muted">{debugInfo.apiUrl}</small>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-md-6">
            <strong>Connection Status:</strong>
            <br />
            <span>{debugInfo.connectionStatus}</span>
          </div>
          <div className="col-md-6">
            <strong>Last Error:</strong>
            <br />
            <small className="text-danger">{debugInfo.lastError || 'None'}</small>
          </div>
        </div>
        <hr />
        <button 
          className="btn btn-sm btn-outline-primary me-2" 
          onClick={testTaskService}
        >
          Test TaskService
        </button>
        <button 
          className="btn btn-sm btn-outline-secondary" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

export default DebugInfo
