// API Base Configuration
const API_BASE_URL = 'http://localhost:8080/api'

// Basic HTTP client implementation
const api = {
  // GET request
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
  // Register new user
  register: async (userData) => {
    return await api.post('/users/register', userData)
  },
  
  // Get all users
  getAllUsers: async () => {
    return await api.get('/users')
  },
  
  // Get user by ID
  getUserById: async (id) => {
    return await api.get(`/users/${id}`)
  },
  
  // Check if user exists
  checkUserExists: async (username, email) => {
    const params = new URLSearchParams()
    if (username) params.append('username', username)
    if (email) params.append('email', email)
    return await api.get(`/users/exists?${params.toString()}`)
  }
}

export default api
export { userAPI } 