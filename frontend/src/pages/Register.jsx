import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const handleInputChange = (e) => {
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
    
    // Clear server error when user types
    if (serverError) {
      setServerError('')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setServerError('')
    
    try {
      // Prepare data for backend API
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      }
      
      // Call real backend API
      const response = await userAPI.register(registrationData)
      
      if (response.success) {
        // Registration successful
        console.log('Registration successful:', response.data)
        alert('Đăng ký thành công! Chuyển về trang chủ...')
        navigate('/')
      } else {
        // Registration failed
        setServerError(response.message || 'Đăng ký thất bại')
      }
      
    } catch (error) {
      console.error('Registration failed:', error)
      setServerError(error.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="h3 mb-2 fw-normal">Tạo tài khoản</h1>
              <p className="text-muted">Điền thông tin để bắt đầu sử dụng Workify</p>
            </div>

            {/* Registration Form */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-sm-5">
                
                {/* Server Error Alert */}
                {serverError && (
                  <div className="alert alert-danger mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  
                  {/* Full Name */}
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label text-dark fw-medium">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${errors.fullName ? 'is-invalid' : ''}`}
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Nhập họ và tên của bạn"
                      disabled={isLoading}
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback">
                        {errors.fullName}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label text-dark fw-medium">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Chọn tên đăng nhập"
                      disabled={isLoading}
                    />
                    {errors.username && (
                      <div className="invalid-feedback">
                        {errors.username}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label text-dark fw-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label text-dark fw-medium">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Tạo mật khẩu mạnh"
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label text-dark fw-medium">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập lại mật khẩu"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang tạo tài khoản...
                        </>
                      ) : (
                        'Tạo tài khoản'
                      )}
                    </button>
                  </div>

                  {/* Divider */}
                  <hr className="my-4" />

                  {/* Login Link */}
                  <div className="text-center">
                    <span className="text-muted">Đã có tài khoản? </span>
                    <Link to="/" className="text-decoration-none fw-medium">
                      Đăng nhập ngay
                    </Link>
                  </div>

                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                Bằng việc tạo tài khoản, bạn đồng ý với{' '}
                <a href="#" className="text-decoration-none">Điều khoản dịch vụ</a>
                {' '}và{' '}
                <a href="#" className="text-decoration-none">Chính sách bảo mật</a>
              </small>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Register 