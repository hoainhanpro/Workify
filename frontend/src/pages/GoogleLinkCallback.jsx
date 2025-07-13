import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import oauthAccountService from '../services/oauthAccountService'

const GoogleLinkCallback = () => {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Đang liên kết tài khoản Google...')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const handleGoogleLinkCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Check for errors from Google
        if (error) {
          throw new Error('Google authorization was cancelled or failed')
        }

        if (!code) {
          throw new Error('No authorization code received from Google')
        }

        setMessage('Đang liên kết với Google...')

        // Handle Google link callback
        const response = await oauthAccountService.handleGoogleLinkCallback(code, state)

        if (response.success) {
          setStatus('success')
          setMessage('Liên kết tài khoản Google thành công!')

          // Redirect to profile after 2 seconds
          setTimeout(() => {
            navigate('/workify/profile', { replace: true })
          }, 2000)

        } else {
          throw new Error(response.message || 'Link failed')
        }

      } catch (error) {
        console.error('Google link error:', error)
        setStatus('error')
        setMessage(error.message || 'Liên kết Google thất bại')

        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate('/workify/profile', { replace: true })
        }, 3000)
      }
    }

    handleGoogleLinkCallback()
  }, [searchParams, navigate])

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
              onClick={() => navigate('/workify/profile', { replace: true })}
            >
              Quay lại Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoogleLinkCallback
