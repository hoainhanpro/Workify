import { useState, useEffect } from 'react'
import authService from '../services/authService'

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = authService.getUser()
        setUser(userData)
        setIsAuthenticated(true)
        
        // Optionally verify token with server
        // const currentUser = await authService.getCurrentUser()
        // setUser(currentUser)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
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
    checkAuth
  }
}

export default useAuth
