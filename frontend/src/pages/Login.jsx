import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import googleOAuthService from '../services/googleOAuthService'
import '../styles/AuthLayout.css'

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { login } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination or default to workify
  const from = location.state?.from?.pathname || '/workify'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username hoặc email là bắt buộc'
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await login(formData.usernameOrEmail, formData.password)
      setMessage('Đăng nhập thành công!')
      
      // Navigate to intended page or workify
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 1000)
    } catch (error) {
      console.error('Login error:', error)
      setMessage(error.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Test OAuth config first
      try {
        const config = await googleOAuthService.testOAuthConfig()
        console.log('✅ OAuth Config Test Successful:', config)
        
        // Show scope information to user
        if (config.scope.includes('gmail.modify') && config.scope.includes('drive.file')) {
          console.log('🎉 Gmail và Drive scopes đã được cấu hình!')
        }
      } catch (configError) {
        console.warn('⚠️ OAuth config test failed:', configError)
      }
      
      googleOAuthService.initiateGoogleLogin()
    } catch (error) {
      console.error('Google login error:', error)
      setMessage('Không thể khởi tạo đăng nhập Google')
    }
  }

  return (
    <div className="auth-form">
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Đăng nhập
      </h2>
      
      {message && (
        <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="usernameOrEmail">Username hoặc Email</label>
          <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            className={`form-control ${errors.usernameOrEmail ? 'is-invalid' : ''}`}
            value={formData.usernameOrEmail}
            onChange={handleChange}
            placeholder="Nhập username hoặc email"
            disabled={loading}
          />
          {errors.usernameOrEmail && (
            <div className="invalid-feedback">{errors.usernameOrEmail}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            disabled={loading}
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span style={{ marginLeft: '8px' }}>Đang đăng nhập...</span>
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span>Hoặc</span>
      </div>

      <button
        type="button"
        className="btn btn-google"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span style={{ marginLeft: '10px' }}>Đăng nhập với Google</span>
      </button>

      <div className="mt-3">
        <small className="text-muted d-block text-center">
          <i className="bi bi-info-circle me-1"></i>
          Workify sẽ yêu cầu quyền truy cập:
        </small>
        <div className="mt-2">
          <small className="text-muted d-block text-center">
            📧 Gmail (đọc email) • 📁 Google Drive (lưu file)
          </small>
        </div>
      </div>

      <div className="auth-link">
        <p>
          Chưa có tài khoản? <Link to="/auth/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}

export default Login 