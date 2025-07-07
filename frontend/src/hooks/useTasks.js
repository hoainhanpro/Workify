import { useState, useEffect } from 'react'
import taskService from '../services/taskService'

export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [statistics, setStatistics] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching tasks...')
      const response = await taskService.getAllTasks()
      console.log('Tasks response:', response)
      
      if (response && response.success) {
        setTasks(response.data || [])
        console.log('Tasks loaded successfully:', response.data?.length || 0, 'tasks')
      } else {
        throw new Error(response?.message || 'Failed to fetch tasks')
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err.message || 'Không thể tải danh sách nhiệm vụ')
      setTasks([]) // Reset tasks on error
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      console.log('Fetching statistics...')
      const response = await taskService.getTaskStatistics()
      console.log('Statistics response:', response)
      
      if (response && response.success) {
        setStatistics(response.data)
        console.log('Statistics loaded successfully:', response.data)
      } else {
        console.warn('Failed to fetch statistics:', response?.message)
        // Don't throw error for statistics, just log warning
      }
    } catch (err) {
      console.error('Error fetching statistics:', err)
      // Don't set error state for statistics failure
    }
  }

  const createTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData)
      
      if (response.success) {
        await fetchTasks() // Refresh tasks list
        await fetchStatistics() // Refresh statistics
        return response
      } else {
        throw new Error(response.message || 'Failed to create task')
      }
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  }

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await taskService.updateTask(taskId, taskData)
      
      if (response.success) {
        await fetchTasks() // Refresh tasks list
        await fetchStatistics() // Refresh statistics
        return response
      } else {
        throw new Error(response.message || 'Failed to update task')
      }
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  }

  const deleteTask = async (taskId) => {
    try {
      const response = await taskService.deleteTask(taskId)
      
      if (response.success) {
        await fetchTasks() // Refresh tasks list
        await fetchStatistics() // Refresh statistics
        return response
      } else {
        throw new Error(response.message || 'Failed to delete task')
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }

  const refreshData = async () => {
    await Promise.all([fetchTasks(), fetchStatistics()])
  }

  useEffect(() => {
    const initializeData = async () => {
      // Only fetch if user is potentially authenticated
      const token = localStorage.getItem('workify_access_token')
      if (token) {
        await fetchTasks()
        await fetchStatistics()
      } else {
        console.warn('No authentication token found, skipping task fetch')
        setLoading(false)
        setError('Please login to view your tasks')
      }
    }

    initializeData()
  }, [])

  return {
    tasks,
    statistics,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refreshData
  }
}

export default useTasks
