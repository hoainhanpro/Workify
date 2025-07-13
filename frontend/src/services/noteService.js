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

  // GĐ5: Pin/Unpin note
  togglePinNote: async (noteId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/${noteId}/pin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi pin/unpin ghi chú')
      }

      return data
    } catch (error) {
      console.error('Error toggling pin note:', error)
      throw error
    }
  },

  // GĐ5: Lấy danh sách notes đã pin
  getPinnedNotes: async () => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/pinned`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách ghi chú đã pin')
      }

      return data
    } catch (error) {
      console.error('Error getting pinned notes:', error)
      throw error
    }
  },

  // GĐ6: Tìm kiếm theo tag
  searchNotesByTag: async (tag) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/search/tag?tag=${encodeURIComponent(tag)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tìm kiếm theo tag')
      }

      return data
    } catch (error) {
      console.error('Error searching notes by tag:', error)
      throw error
    }
  },

  // GĐ6: Tìm kiếm theo từ khóa (nâng cấp method hiện tại)
  searchNotesByKeyword: async (keyword) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/search/keyword?keyword=${encodeURIComponent(keyword)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tìm kiếm theo từ khóa')
      }

      return data
    } catch (error) {
      console.error('Error searching notes by keyword:', error)
      throw error
    }
  },

  // Tìm kiếm notes theo tagId
  searchNotesByTagId: async (tagId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/search/tag/${tagId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tìm kiếm theo tag')
      }

      return data
    } catch (error) {
      console.error('Error searching notes by tag ID:', error)
      throw error
    }
  },

  // Tìm kiếm notes theo nhiều tagIds
  searchNotesByTagIds: async (tagIds) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const tagIdsParam = tagIds.join(',')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/search/tags?tagIds=${encodeURIComponent(tagIdsParam)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tìm kiếm theo tags')
      }

      return data
    } catch (error) {
      console.error('Error searching notes by tag IDs:', error)
      throw error
    }
  },

  // Lấy tất cả tags của một note
  getNoteTags: async (noteId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/${noteId}/tags`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy tags của note')
      }

      return data
    } catch (error) {
      console.error('Error getting note tags:', error)
      throw error
    }
  },

  // Cập nhật tags cho note
  updateNoteTags: async (noteId, tagIds) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/${noteId}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tagIds })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi cập nhật tags cho note')
      }

      return data
    } catch (error) {
      console.error('Error updating note tags:', error)
      throw error
    }
  },

  // Thêm tag vào note
  addTagToNote: async (noteId, tagId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/${noteId}/tags/${tagId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi thêm tag vào note')
      }

      return data
    } catch (error) {
      console.error('Error adding tag to note:', error)
      throw error
    }
  },

  // Xóa tag khỏi note
  removeTagFromNote: async (noteId, tagId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      const response = await fetch(`${API_CONFIG.baseUrl}/notes/${noteId}/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi xóa tag khỏi note')
      }

      return data
    } catch (error) {
      console.error('Error removing tag from note:', error)
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
