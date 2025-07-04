// API Base Configuration
const API_BASE_URL = 'http://localhost:8080/api'

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('workify_access_token')
}

// Basic HTTP client implementation
const api = {
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
  
  // PUT request
  put: async (endpoint, data, requiresAuth = false) => {
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
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`)
      }
      
      return responseData
    } catch (error) {
      console.error('PUT request failed:', error)
      throw error
    }
  },
  
  // DELETE request
  delete: async (endpoint, requiresAuth = false) => {
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
        method: 'DELETE',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('DELETE request failed:', error)
      throw error
    }
  }
}

// User API functions
const userAPI = {
  // Get all users (Admin only)
  getAllUsers: async () => {
    return await api.get('/users', true)
  },
  
  // Get user by ID
  getUserById: async (id) => {
    return await api.get(`/users/${id}`, true)
  },
  
  // Get user by username
  getUserByUsername: async (username) => {
    return await api.get(`/users/username/${username}`, true)
  },
  
  // Check if user exists (public)
  checkUserExists: async (username, email) => {
    const params = new URLSearchParams()
    if (username) params.append('username', username)
    if (email) params.append('email', email)
    return await api.get(`/users/exists?${params.toString()}`, false)
  },
  
  // Update user status (Admin only)
  updateUserStatus: async (id, enabled) => {
    return await api.put(`/users/${id}/status`, { enabled }, true)
  },
  
  // Update user role (Admin only)
  updateUserRole: async (id, role) => {
    return await api.put(`/users/${id}/role`, { role }, true)
  },
  
  // Delete user (Admin only)
  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`, true)
  },
  
  // Get user statistics (Admin only)
  getUserStats: async () => {
    return await api.get('/users/stats', true)
  }
}

// Authentication API functions
const authAPI = {
  // Register new user (public)
  register: async (userData) => {
    return await api.post('/auth/register', userData, false)
  },
  
  // Login user (public)
  login: async (credentials) => {
    return await api.post('/auth/login', credentials, false)
  },
  
  // Refresh access token (public)
  refreshToken: async (refreshToken) => {
    return await api.post('/auth/refresh', { refreshToken }, false)
  },
  
  // Get current user profile (requires auth)
  getProfile: async () => {
    return await api.get('/auth/profile', true)
  },
  
  // Get authentication status (requires auth)
  getAuthStatus: async () => {
    return await api.get('/auth/status', true)
  },
  
  // Logout current session (requires auth)
  logout: async () => {
    return await api.post('/auth/logout', {}, true)
  },
  
  // Logout from all devices (requires auth)
  logoutAll: async () => {
    return await api.post('/auth/logout-all', {}, true)
  }
}

export default api
export { userAPI, authAPI } 