// API Base Configuration
const API_BASE_URL = 'http://localhost:8080/api'

// Token management
const TOKEN_KEY = 'workify_access_token'
const REFRESH_TOKEN_KEY = 'workify_refresh_token'
const USER_KEY = 'workify_user'

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

// Basic HTTP client for auth operations
const authAPI = {
  // POST request
  post: async (endpoint, data, requiresAuth = false) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      // Add auth header if required
      if (requiresAuth) {
        const token = getAuthToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`)
      }
      
      return responseData
    } catch (error) {
      console.error('POST request failed:', error)
      throw error
    }
  },

  // GET request
  get: async (endpoint, requiresAuth = false) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      // Add auth header if required
      if (requiresAuth) {
        const token = getAuthToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('GET request failed:', error)
      throw error
    }
  },

  // Authentication API functions
  register: async (userData) => {
    return await authAPI.post('/auth/register', userData, false)
  },

  login: async (credentials) => {
    return await authAPI.post('/auth/login', credentials, false)
  },

  refreshToken: async (refreshToken) => {
    return await authAPI.post('/auth/refresh', { refreshToken }, false)
  },

  getProfile: async () => {
    return await authAPI.get('/auth/profile', true)
  },

  getAuthStatus: async () => {
    return await authAPI.get('/auth/status', true)
  },

  logout: async () => {
    return await authAPI.post('/auth/logout', {}, true)
  },

  logoutAll: async () => {
    return await authAPI.post('/auth/logout-all', {}, true)
  }
}

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
