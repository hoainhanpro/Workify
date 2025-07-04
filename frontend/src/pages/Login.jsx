import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
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

      <div className="auth-link">
        <p>
          Chưa có tài khoản? <Link to="/auth/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}

export default Login 