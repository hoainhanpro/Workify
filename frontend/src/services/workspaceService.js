const API_BASE_URL = 'http://localhost:8080/api';

// Token keys (matching authService)
const TOKEN_KEY = 'workify_access_token'

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.warn('No authentication token found');
    return null;
  }
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
};

// Workspace Service
const workspaceService = {
  // Get all workspaces for current user
  getAllWorkspaces: async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Backend trả về {success: true, data: [...]}
      return result.data || [];
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  },

  // Get workspace by ID
  getWorkspaceById: async (workspaceId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result; // Return data if exists, otherwise full result
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }
  },

  // Create new workspace
  createWorkspace: async (workspaceData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData),
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },

  // Update workspace
  updateWorkspace: async (workspaceId, workspaceData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData),
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  },

  // Get workspace members
  getWorkspaceMembers: async (workspaceId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (workspaceId, memberId, newRole) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  },

  // Remove member from workspace
  removeMember: async (workspaceId, memberId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  },

  // Leave workspace
  leaveWorkspace: async (workspaceId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error leaving workspace:', error);
      throw error;
    }
  }
};

export default workspaceService;
