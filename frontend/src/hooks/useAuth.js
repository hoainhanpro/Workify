import { useState, useEffect } from 'react'
import authService from '../services/authService'

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    
    // Listen for storage changes để maintain auth state across tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'workify_access_token' || e.key === 'workify_user') {
        console.log('🔄 Storage changed, re-checking auth...')
        checkAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking auth state...')
      const token = localStorage.getItem('workify_access_token')
      const userData = localStorage.getItem('workify_user')
      
      console.log('Token exists:', !!token)
      console.log('User data exists:', !!userData)
      
      if (token && userData) {
        // Có cả token và user data
        try {
          const user = JSON.parse(userData)
          console.log('✅ User data parsed successfully:', user)
          setUser(user)
          setIsAuthenticated(true)
        } catch (parseError) {
          console.error('❌ Failed to parse user data:', parseError)
          // Clear corrupted data
          localStorage.removeItem('workify_user')
          setUser(null)
          setIsAuthenticated(false)
        }
      } else if (authService.isAuthenticated()) {
        // Fallback - có token nhưng không có user data
        console.log('⚠️ Token exists but no user data, trying authService...')
        const user = authService.getUser()
        console.log('User from authService:', user)
        if (user) {
          setUser(user)
          setIsAuthenticated(true)
        } else {
          console.log('❌ No user from authService')
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        console.log('❌ No token or user data')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Không call logout() để tránh infinite loop
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await authService.login(usernameOrEmail, password)
      if (response.success && response.data.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        return response
      }
      throw new Error(response.message || 'Login failed')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    setUser,
    setIsAuthenticated
  }
}

export default useAuth
