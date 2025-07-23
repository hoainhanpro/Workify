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

// Workspace Invitation Service
const workspaceInvitationService = {
  // Send invitation
  sendInvitation: async (workspaceId, invitationData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      // Transform emailOrUsername to correct backend format
      const backendData = {
        role: invitationData.role
      };

      const emailOrUsername = invitationData.emailOrUsername;
      if (!emailOrUsername || emailOrUsername.trim() === '') {
        throw new Error('Email hoặc username không được để trống');
      }

      // Check if it's an email (contains @) or username
      if (emailOrUsername.includes('@')) {
        backendData.invitedEmail = emailOrUsername.trim();
      } else {
        backendData.invitedUsername = emailOrUsername.trim();
      }

      console.log('Sending invitation with data:', backendData);

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
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
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  // Get pending invitations for current user
  getPendingInvitations: async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/invitations/my`, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      throw error;
    }
  },

  // Accept invitation
  acceptInvitation: async (invitationId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/invitations/${invitationId}/accept`, {
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

      return await response.json();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  // Decline invitation
  declineInvitation: async (invitationId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/invitations/${invitationId}/decline`, {
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
      console.error('Error declining invitation:', error);
      throw error;
    }
  },

  // Get workspace invitations (for workspace admins)
  getWorkspaceInvitations: async (workspaceId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/invitations`, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching workspace invitations:', error);
      throw error;
    }
  },

  // Cancel invitation (for workspace admins)
  cancelInvitation: async (invitationId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/workspaces/invitations/${invitationId}`, {
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
      console.error('Error canceling invitation:', error);
      throw error;
    }
  }
};

export default workspaceInvitationService;
