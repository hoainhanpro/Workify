import { API_CONFIG } from '../config/oauth'

// Workspace API Service
const workspaceService = {
  // Get workspace statistics
  getWorkspaceStats: async (workspaceId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/workspaces/${workspaceId}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy thống kê workspace')
      }

      return data
    } catch (error) {
      console.error('Error getting workspace stats:', error)
      throw error
    }
  },

  // Get workspace activity summary
  getWorkspaceActivitySummary: async (workspaceId) => {
    try {
      const token = localStorage.getItem('workify_access_token')
      
      const response = await fetch(`${API_CONFIG.baseUrl}/workspaces/${workspaceId}/activity-summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy tóm tắt hoạt động workspace')
      }

      return data
    } catch (error) {
      console.error('Error getting workspace activity summary:', error)
      throw error
    }
  },

  // Existing workspace methods from workspaceService.js (if any)
  // TODO: Check if there's an existing workspaceService.js and merge
}

export default workspaceService
