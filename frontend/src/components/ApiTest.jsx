import React, { useState, useEffect } from 'react'
import { userAPI } from '../services/api'

const ApiTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Đang kiểm tra...')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Testing API connection...')
      const response = await userAPI.getAllUsers()
      
      if (response.success) {
        setConnectionStatus('✅ Kết nối thành công!')
        setUsers(response.data || [])
      } else {
        setConnectionStatus('❌ Kết nối thất bại')
        setError(response.message || 'Unknown error')
      }
    } catch (err) {
      setConnectionStatus('❌ Lỗi kết nối')
      setError(err.message || 'Cannot connect to backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">API Connection Test</h5>
        </div>
        <div className="card-body">
          
          {/* Connection Status */}
          <div className="mb-3">
            <strong>Trạng thái kết nối: </strong>
            <span className={loading ? 'text-warning' : error ? 'text-danger' : 'text-success'}>
              {connectionStatus}
            </span>
            {loading && <div className="spinner-border spinner-border-sm ms-2" role="status"></div>}
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger">
              <strong>Lỗi: </strong>{error}
            </div>
          )}

          {/* Users List */}
          {!loading && !error && (
            <div>
              <h6>Users trong database ({users.length}):</h6>
              {users.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td><small>{user.id}</small></td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.fullName}</td>
                          <td><span className="badge bg-secondary">{user.role}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">Chưa có user nào trong database</p>
              )}
            </div>
          )}

          {/* Test Button */}
          <div className="mt-3">
            <button 
              className="btn btn-primary btn-sm" 
              onClick={testConnection}
              disabled={loading}
            >
              {loading ? 'Đang test...' : 'Test lại kết nối'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ApiTest 