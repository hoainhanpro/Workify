import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import WorkifyLayout from './layouts/WorkifyLayout'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Tags from './pages/Tags'
import Mail from './pages/Mail'
import Profile from './pages/Profile'
import Workspaces from './pages/Workspaces'
import GoogleCallback from './pages/GoogleCallback'
import GoogleLinkCallback from './pages/GoogleLinkCallback'
import ProtectedRoute from './components/ProtectedRoute'
import { StagewiseToolbar } from '@stagewise/toolbar-react'
import { ReactPlugin } from '@stagewise-plugins/react'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        {/* Stagewise Toolbar - only in development mode */}
        <StagewiseToolbar 
          config={{
            plugins: [ReactPlugin]
          }}
          enabled={import.meta.env.DEV}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
          </Route>
          
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="google/callback" element={<GoogleCallback />} />
            <Route path="google/link-callback" element={<GoogleLinkCallback />} />
          </Route>
          
          {/* Legacy routes redirect */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          
          {/* Protected Workify Routes */}
          <Route path="/workify" element={
            <ProtectedRoute>
              <WorkifyLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/workify/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workspaces" element={<Workspaces />} />
            <Route path="tags" element={<Tags />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="notes" element={<Notes />} />
            <Route path="mail" element={<Mail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App 