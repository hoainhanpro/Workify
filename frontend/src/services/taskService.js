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

// Task Service
const taskService = {
  // Get all tasks for current user
  getAllTasks: async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view tasks.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get task by ID
  getTaskById: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Get tasks by status
  getTasksByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      throw error;
    }
  },

  // Get tasks by priority
  getTasksByPriority: async (priority) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/priority/${priority}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks by priority:', error);
      throw error;
    }
  },

  // Search tasks
  searchTasks: async (searchTerm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  },

  // Get tasks by tag
  getTasksByTag: async (tag) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/tag/${tag}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks by tag:', error);
      throw error;
    }
  },

  // Search tasks by tag ID
  searchTasksByTagId: async (tagId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/tag/${tagId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching tasks by tag ID:', error);
      throw error;
    }
  },

  // Get task statistics
  getTaskStatistics: async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}/tasks/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Get all tags
  getAllTags: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  // ================ SUBTASK MANAGEMENT ================
  
  // Create subtask
  createSubTask: async (taskId, subTaskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify(subTaskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subtask:', error);
      throw error;
    }
  },

  // Update subtask
  updateSubTask: async (taskId, subTaskId, subTaskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify(subTaskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  },

  // Delete subtask
  deleteSubTask: async (taskId, subTaskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  },

  // ================ CALENDAR INTEGRATION ================
  
  // Update calendar sync setting
  updateCalendarSync: async (taskId, enabled) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/calendar/sync`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating calendar sync:', error);
      throw error;
    }
  },

  // Sync task with calendar manually
  syncTaskWithCalendar: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/calendar/sync`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing task with calendar:', error);
      throw error;
    }
  },

  // Bulk sync all tasks with calendar
  syncAllTasksWithCalendar: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/calendar/sync-all`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing all tasks with calendar:', error);
      throw error;
    }
  },

  // Get calendar event for task
  getTaskCalendarEvent: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/calendar/event`, {
        method: 'GET',
        headers: {
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting calendar event:', error);
      throw error;
    }
  },

  // Share task to workspace
  shareTaskToWorkspace: async (taskId, workspaceId, permissions) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/share-to-workspace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify({
          workspaceId,
          permissions
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sharing task to workspace:', error);
      throw error;
    }
  },

  // Unshare task from workspace
  unshareTaskFromWorkspace: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/unshare-from-workspace`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error unsharing task from workspace:', error);
      throw error;
    }
  },

  // Add edit permission for task
  addTaskEditPermission: async (taskId, targetUserId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/add-edit-permission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding edit permission:', error);
      throw error;
    }
  },
};

export default taskService;