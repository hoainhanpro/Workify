import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import googleOAuthService from '../services/googleOAuthService'
import { STORAGE_KEYS } from '../config/oauth'

const GoogleCallback = () => {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Đang xử lý đăng nhập Google...')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser, setIsAuthenticated, checkAuth, isAuthenticated } = useAuthContext()

  useEffect(() => {
    console.log('GoogleCallback component mounted')
    
    // Create a more robust execution guard using URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const executionKey = `oauth_execution_${code?.slice(0, 10)}`
    
    // Check if this specific authorization code has already been processed
    if (sessionStorage.getItem(executionKey)) {
      console.log('⚠️ This authorization code has already been processed, skipping...')
      navigate('/workify/profile', { replace: true })
      return
    }
    
    const handleGoogleCallback = async () => {
      // Mark this code as being processed
      sessionStorage.setItem(executionKey, 'processing')
      
      try {
        console.log('Starting Google callback processing...')
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        console.log('Callback params:', { code: code?.slice(0, 20) + '...', state, error })

        // Check for errors from Google
        if (error) {
          throw new Error('Google authentication was cancelled or failed')
        }

        if (!code) {
          throw new Error('No authorization code received from Google')
        }

        // Verify state parameter for CSRF protection
        console.log('Verifying state parameter...')
        console.log('State from URL:', state)
        console.log('Saved state in localStorage:', localStorage.getItem('oauth_state'))
        
        // Skip state verification trong development mode để tránh React StrictMode issues
        const isDevelopment = process.env.NODE_ENV === 'development'
        if (!isDevelopment && !googleOAuthService.verifyState(state)) {
          console.error('State verification failed')
          throw new Error('Invalid state parameter. Possible CSRF attack.')
        } else if (isDevelopment) {
          console.log('⚠️ State verification skipped in development mode')
          // Clear state anyway
          localStorage.removeItem('oauth_state')
        } else {
          console.log('State verified successfully')
        }

        setMessage('Đang xác thực với Google...')

        // Handle Google callback
        console.log('Calling backend OAuth callback...')
        const response = await googleOAuthService.handleGoogleCallback(code, state)
        console.log('Backend response:', response)

        if (response.success && response.data) {
          // Store tokens với key authService sử dụng
          localStorage.setItem('workify_access_token', response.data.accessToken)
          if (response.data.refreshToken) {
            localStorage.setItem('workify_refresh_token', response.data.refreshToken)
          }
          
          // Store user data với validation
          if (response.data.user) {
            console.log('📝 Storing user data:', response.data.user)
            localStorage.setItem('workify_user', JSON.stringify(response.data.user))
            
            // Verify data was stored correctly
            const storedUser = localStorage.getItem('workify_user')
            console.log('✅ Verified stored user data:', storedUser)
          } else {
            console.error('❌ No user data in response')
          }
          
          // Store Google access token if provided
          if (response.data.googleAccessToken) {
            localStorage.setItem(STORAGE_KEYS.googleAccessToken, response.data.googleAccessToken)
          }
          
          // Update auth context
          console.log('📝 Updating auth context...')
          setUser(response.data.user)
          setIsAuthenticated(true)

          // Navigate immediately - localStorage có data rồi, ProtectedRoute sẽ pass
          console.log('🎯 Navigating to profile immediately with localStorage data...')
          navigate('/workify/profile', { replace: true })
          
          // Force context update sau khi navigate
          setTimeout(async () => {
            if (checkAuth) {
              console.log('🔄 Force context refresh after navigation...')
              await checkAuth()
            }
            // Trigger manual event để force useAuth re-check
            window.dispatchEvent(new Event('storage'))
          }, 50)
          
          setStatus('success')
          setMessage(response.data.isNewUser ? 
            'Tài khoản mới đã được tạo thành công!' : 
            'Đăng nhập Google thành công!'
          )
          
          // Mark as successfully processed
          sessionStorage.setItem(executionKey, 'completed')

        } else {
          throw new Error(response.message || 'Authentication failed')
        }

      } catch (error) {
        console.error('Google OAuth error:', error)
        
        // Check if it's a duplicate/already used code error
        if (error.message && error.message.includes('already been used')) {
          console.log('🔄 Authorization code already used, redirecting to profile...')
          // This might be a duplicate request, try to navigate to profile
          navigate('/workify/profile', { replace: true })
          return
        }
        
        setStatus('error')
        setMessage(error.message || 'Đăng nhập Google thất bại')
        
        // Mark as failed but don't prevent retry
        sessionStorage.removeItem(executionKey)

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login', { replace: true })
        }, 3000)
      }
    }

    handleGoogleCallback()
  }, [searchParams, navigate, setUser, setIsAuthenticated, checkAuth])

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body text-center p-5">
          {status === 'processing' && (
            <>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="text-primary">Đang xử lý...</h4>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-success mb-3">
                <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4 className="text-success">Thành công!</h4>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-danger mb-3">
                <i className="bi bi-x-circle-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4 className="text-danger">Lỗi!</h4>
            </>
          )}
          
          <p className="text-muted mt-3">{message}</p>
          
          {status === 'error' && (
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/auth/login', { replace: true })}
            >
              Quay lại đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoogleCallback
