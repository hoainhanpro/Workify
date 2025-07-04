// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api'

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'workify_access_token',
  REFRESH_TOKEN: 'workify_refresh_token',
  USER: 'workify_user'
}

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER'
}

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ADMIN: '/admin',
  USERS: '/admin/users'
}

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    PROFILE: '/auth/profile',
    STATUS: '/auth/status'
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    BY_USERNAME: (username) => `/users/username/${username}`,
    EXISTS: '/users/exists',
    STATS: '/users/stats',
    UPDATE_STATUS: (id) => `/users/${id}/status`,
    UPDATE_ROLE: (id) => `/users/${id}/role`
  }
}

export default {
  API_BASE_URL,
  STORAGE_KEYS,
  USER_ROLES,
  ROUTES,
  ENDPOINTS
}
