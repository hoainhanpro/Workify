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

  // Share task to workspace (existing)
  shareTaskToWorkspace: async (taskId, workspaceId, permissions) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/share-to-workspace/${workspaceId}`, {
        method: 'POST',
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
      console.error('Error sharing task to workspace:', error);
      throw error;
    }
  },

  // Share task to workspace with detailed permissions (NEW)
  shareTaskToWorkspaceDetailed: async (taskId, shareRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/share-to-workspace-detailed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify(shareRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sharing task with detailed permissions:', error);
      throw error;
    }
  },

  // Update task permissions (NEW)
  updateTaskPermissions: async (taskId, permissionsRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify(permissionsRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task permissions:', error);
      throw error;
    }
  },

  // Assign task to user (existing basic)
  assignTaskToUser: async (taskId, assigneeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/assign/${assigneeId}`, {
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
      console.error('Error assigning task:', error);
      throw error;
    }
  },

  // Assign task with detailed info (NEW)
  assignTaskDetailed: async (taskId, assignRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/assign-detailed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify(assignRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning task with details:', error);
      throw error;
    }
  },

  // Get workspace tasks (NEW)
  getWorkspaceTasks: async (workspaceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/workspace/${workspaceId}`, {
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
      console.error('Error getting workspace tasks:', error);
      throw error;
    }
  },

  // Get workspace tasks with detailed info (NEW)
  getWorkspaceTasksDetailed: async (workspaceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/workspace/${workspaceId}/detailed`, {
        method: 'GET',
        headers: {
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || []; // Return data array, not full response
    } catch (error) {
      console.error('Error getting detailed workspace tasks:', error);
      throw error;
    }
  },

  // Get assigned tasks in workspace (NEW)
  getAssignedTasksInWorkspace: async (workspaceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/workspace/${workspaceId}/assigned-to-me`, {
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
      console.error('Error getting assigned tasks:', error);
      throw error;
    }
  },

  // Unshare task from workspace (existing)
  unshareTaskFromWorkspace: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/unshare-from-workspace`, {
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
      console.error('Error unsharing task from workspace:', error);
      throw error;
    }
  },

  // LEGACY - Remove old method, replaced by assignTaskToUser
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