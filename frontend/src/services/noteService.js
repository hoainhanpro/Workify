import { API_CONFIG } from '../config/oauth'

// Note API Service
const noteService = {
  // Tạo note mới
  createNote: async (noteData) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      console.log('🔑 Creating note with token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
      })

      console.log('📤 Create note response status:', response.status)
      const data = await response.json()
      console.log('📤 Create note response data:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tạo ghi chú')
      }

      return data
    } catch (error) {
      console.error('Error creating note:', error)
      throw error
    }
  },

  // Lấy tất cả notes
  getAllNotes: async () => {
    try {
      const token = localStorage.getItem('workify_access_token')
      console.log('🔑 Getting notes with token:', token ? 'Token exists' : 'No token')
      console.log('🔗 API URL:', `${API_CONFIG.baseUrl}/notes`)
      
      const response = await fetch(`${API_CONFIG.baseUrl}/notes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📥 Get notes response status:', response.status)
      const data = await response.json()
      console.log('📥 Get notes response data:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách ghi chú')
      }

      return data
    } catch (error) {
      console.error('Error fetching notes:', error)
      throw error
    }
  },

  // Lấy note theo ID
  getNoteById: async (noteId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/${noteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy ghi chú')
      }

      return data
    } catch (error) {
      console.error('Error fetching note:', error)
      throw error
    }
  },

  // Cập nhật note
  updateNote: async (noteId, noteData) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi cập nhật ghi chú')
      }

      return data
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  },

  // Xóa note
  deleteNote: async (noteId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi xóa ghi chú')
      }

      return data
    } catch (error) {
      console.error('Error deleting note:', error)
      throw error
    }
  },

  // Tìm kiếm notes
  searchNotes: async (keyword) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/search?keyword=${encodeURIComponent(keyword)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tìm kiếm ghi chú')
      }

      return data
    } catch (error) {
      console.error('Error searching notes:', error)
      throw error
    }
  },

  // Lấy thống kê notes
  getNoteStats: async () => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy thống kê')
      }

      return data
    } catch (error) {
      console.error('Error fetching note stats:', error)
      throw error
    }
  }
}

export default noteService
