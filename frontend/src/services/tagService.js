import { API_CONFIG } from '../config/oauth'

// Tag API Service
const tagService = {
  // Tạo tag mới
  createTag: async (tagData) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tagData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tạo tag')
      }

      return data
    } catch (error) {
      console.error('Error creating tag:', error)
      throw error
    }
  },

  // Lấy tất cả tags của user
  getAllTags: async () => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/tags`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách tags')
      }

      return data
    } catch (error) {
      console.error('Error getting tags:', error)
      throw error
    }
  },

  // Lấy tag theo ID
  getTagById: async (tagId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/tags/${tagId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy thông tin tag')
      }

      return data
    } catch (error) {
      console.error('Error getting tag:', error)
      throw error
    }
  },

  // Cập nhật tag
  updateTag: async (tagId, tagData) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/tags/${tagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tagData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi cập nhật tag')
      }

      return data
    } catch (error) {
      console.error('Error updating tag:', error)
      throw error
    }
  },

  // Xóa tag
  deleteTag: async (tagId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi xóa tag')
      }

      return data
    } catch (error) {
      console.error('Error deleting tag:', error)
      throw error
    }
  },

  // Tìm kiếm tags theo tên
  searchTags: async (keyword) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/tags/search?keyword=${encodeURIComponent(keyword)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tìm kiếm tags')
      }

      return data
    } catch (error) {
      console.error('Error searching tags:', error)
      throw error
    }
  },

  // Lấy tags theo màu sắc
  getTagsByColor: async (color) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      // Remove # from color if present
      const colorCode = color.replace('#', '')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/tags/color/${colorCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy tags theo màu')
      }

      return data
    } catch (error) {
      console.error('Error getting tags by color:', error)
      throw error
    }
  },

  // Lấy thống kê tags
  getTagStats: async () => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/tags/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy thống kê tags')
      }

      return data
    } catch (error) {
      console.error('Error getting tag stats:', error)
      throw error
    }
  }
}

export default tagService
