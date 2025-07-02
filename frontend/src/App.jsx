import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './pages/Register'
import ApiTest from './components/ApiTest'

function App() {
  return (
    <div className="App min-vh-100 bg-light">
      <Routes>
        <Route path="/" element={
          <div className="container-fluid py-4">
            <div className="text-center mb-4">
              <h1>Workify</h1>
              <p className="text-muted">Sẵn sàng để phát triển!</p>
              <div className="gap-2 d-flex justify-content-center">
                <a href="/register" className="btn btn-primary">Đăng ký tài khoản</a>
                <a href="/test-api" className="btn btn-outline-secondary">Test API</a>
              </div>
            </div>
            <ApiTest />
          </div>
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/test-api" element={<ApiTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App 