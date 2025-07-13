import { OAUTH_CONFIG, API_CONFIG, STORAGE_KEYS } from '../config/oauth'

// OAuth Account Management Service
const oauthAccountService = {
  // Lấy thông tin các OAuth accounts đã liên kết
  getLinkedAccounts: async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.accessToken)
      if (!token) {
        throw new Error('No access token available')
      }

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.oauth.linkedAccounts}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get linked accounts')
      }

      return data
    } catch (error) {
      console.error('Get linked accounts error:', error)
      throw error
    }
  },

  // Liên kết tài khoản Google (redirect to Google OAuth)
  linkGoogleAccount: () => {
    const linkingState = Math.random().toString(36).substring(7)
    
    const params = new URLSearchParams({
      client_id: OAUTH_CONFIG.google.clientId,
      redirect_uri: OAUTH_CONFIG.google.redirectUri,
      response_type: 'code',
      scope: OAUTH_CONFIG.google.scope,
      access_type: 'offline',
      prompt: 'consent',
      state: linkingState
    })
    
    const authUrl = `${OAUTH_CONFIG.google.authUrl}?${params.toString()}`
    
    // Lưu state để verify sau
    localStorage.setItem(STORAGE_KEYS.oauthState, linkingState)
    localStorage.setItem(STORAGE_KEYS.linkingMode, 'true')
    
    // Redirect to Google
    window.location.href = authUrl
  },

  // Process Google link callback
  processGoogleLinkCallback: async (code, state) => {
    try {
      // Verify state parameter
      const savedState = localStorage.getItem(STORAGE_KEYS.oauthState)
      localStorage.removeItem(STORAGE_KEYS.oauthState)
      localStorage.removeItem(STORAGE_KEYS.linkingMode)
      
      if (savedState !== state) {
        throw new Error('Invalid state parameter. Possible CSRF attack.')
      }

      const token = localStorage.getItem(STORAGE_KEYS.accessToken)
      if (!token) {
        throw new Error('No access token available')
      }

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.oauth.link}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirectUri: OAUTH_CONFIG.google.redirectUri,
          state: state
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to link Google account')
      }

      return data
    } catch (error) {
      console.error('Google link callback error:', error)
      throw error
    }
  },

  // Xử lý link Google account callback
  handleGoogleLinkCallback: async (code, state) => {
    try {
      // Verify state parameter
      const savedState = localStorage.getItem('google_link_state')
      localStorage.removeItem('google_link_state')
      
      if (savedState !== state) {
        throw new Error('Invalid state parameter. Possible CSRF attack.')
      }

      const token = localStorage.getItem(STORAGE_KEYS.accessToken)
      if (!token) {
        throw new Error('No access token available')
      }

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.oauth.link}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirectUri: OAUTH_CONFIG.google.redirectUri,
          state: state
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to link Google account')
      }

      return data
    } catch (error) {
      console.error('Google link callback error:', error)
      throw error
    }
  },

  // Hủy liên kết tài khoản Google
  unlinkGoogleAccount: async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.accessToken)
      if (!token) {
        throw new Error('No access token available')
      }

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.oauth.unlink}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to unlink Google account')
      }

      return data
    } catch (error) {
      console.error('Unlink Google account error:', error)
      throw error
    }
  },

  // Refresh Google access token (để gọi Google APIs)
  refreshGoogleToken: async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.accessToken)
      if (!token) {
        throw new Error('No access token available')
      }

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.oauth.refresh}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh Google token')
      }

      // Update Google access token in localStorage
      if (data.data && data.data.googleAccessToken) {
        localStorage.setItem(STORAGE_KEYS.googleAccessToken, data.data.googleAccessToken)
      }

      return data
    } catch (error) {
      console.error('Refresh Google token error:', error)
      throw error
    }
  }
}

// Generate security token for CSRF protection
const generateSecurityToken = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export default oauthAccountService
