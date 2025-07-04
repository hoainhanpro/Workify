import { authAPI } from './api.js'

// Token management
const TOKEN_KEY = 'workify_access_token'
const REFRESH_TOKEN_KEY = 'workify_refresh_token'
const USER_KEY = 'workify_user'

const authService = {
  // Set tokens in localStorage
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  // Set user data
  setUser: (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  },

  // Get user data
  getUser: () => {
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  },

  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getAccessToken()
  },

  // Login
  login: async (usernameOrEmail, password) => {
    try {
      const response = await authAPI.login({ usernameOrEmail, password })
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data
        
        // Store tokens and user data
        authService.setTokens(accessToken, refreshToken)
        if (user) {
          authService.setUser(user)
        }
        
        return response
      }
      
      throw new Error(response.message || 'Login failed')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return response
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  },

  // Logout
  logout: async () => {
    try {
      if (authService.isAuthenticated()) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authService.clearAuth()
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = authService.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refreshToken(refreshToken)
      
      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data
        authService.setTokens(accessToken, newRefreshToken)
        return response
      }
      
      throw new Error('Token refresh failed')
    } catch (error) {
      console.error('Token refresh error:', error)
      authService.clearAuth()
      throw error
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await authAPI.getProfile()
      
      if (response.success && response.data) {
        authService.setUser(response.data)
        return response.data
      }
      
      throw new Error('Failed to get user profile')
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }
}

export default authService
