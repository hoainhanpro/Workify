import { OAUTH_CONFIG, API_CONFIG, STORAGE_KEYS } from '../config/oauth'

// Google OAuth Service
const googleOAuthService = {
  // Generate Google OAuth URL
  getGoogleAuthUrl: () => {
    const state = generateSecurityToken()
    
    const params = new URLSearchParams({
      client_id: OAUTH_CONFIG.google.clientId,
      redirect_uri: OAUTH_CONFIG.google.redirectUri,
      response_type: 'code',
      scope: OAUTH_CONFIG.google.scope,
      access_type: 'offline',
      prompt: 'consent',
      state: state
    })
    
    return {
      url: `${OAUTH_CONFIG.google.authUrl}?${params.toString()}`,
      state: state
    }
  },

  // Xử lý Google OAuth callback
  handleGoogleCallback: async (code, state) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.oauth.callback}`, {
        method: 'POST',
        headers: {
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
        throw new Error(data.message || 'Google authentication failed')
      }

      return data
    } catch (error) {
      console.error('Google OAuth callback error:', error)
      throw error
    }
  },

  // Khởi tạo Google OAuth login
  initiateGoogleLogin: () => {
    const authData = googleOAuthService.getGoogleAuthUrl()
    
    // Debug logging
    console.log('Google OAuth URL:', authData.url)
    console.log('State:', authData.state)
    console.log('Client ID:', OAUTH_CONFIG.google.clientId)
    console.log('Redirect URI:', OAUTH_CONFIG.google.redirectUri)
    
    // Lưu state để verify sau
    localStorage.setItem(STORAGE_KEYS.oauthState, authData.state)
    
    // Redirect to Google
    window.location.href = authData.url
  },

  // Verify state parameter
  verifyState: (receivedState) => {
    const savedState = localStorage.getItem(STORAGE_KEYS.oauthState)
    console.log('🔐 State verification:', { savedState, receivedState })
    
    if (!savedState) {
      console.error('❌ No saved state found')
      return false
    }
    
    if (!receivedState) {
      console.error('❌ No received state')
      return false
    }
    
    const isValid = savedState === receivedState
    console.log('🔍 State match:', isValid)
    
    // Chỉ xóa state khi verification thành công
    if (isValid) {
      localStorage.removeItem(STORAGE_KEYS.oauthState)
      console.log('✅ State verified and cleared')
    }
    
    return isValid
  }
}

// Generate security token for CSRF protection
const generateSecurityToken = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export default googleOAuthService
