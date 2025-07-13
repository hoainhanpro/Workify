import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthContext()
  const location = useLocation()

  console.log('🛡️ ProtectedRoute check:', { 
    isAuthenticated, 
    loading, 
    hasUser: !!user,
    pathname: location.pathname,
    token: !!localStorage.getItem('workify_access_token'),
    userData: !!localStorage.getItem('workify_user')
  })

  if (loading) {
    console.log('⏳ Auth still loading...')
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login')
    // Redirect to login with return url
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  console.log('✅ Authenticated, rendering protected content')
  return children
}

export default ProtectedRoute
