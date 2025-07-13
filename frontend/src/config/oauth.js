// OAuth Configuration
export const OAUTH_CONFIG = {
  google: {
    clientId: '261651124656-tsgi6qkcj21j73j54qjo8t4rmkdh8uc9.apps.googleusercontent.com',
    redirectUri: 'http://localhost:3000/auth/google/callback',
    scope: 'openid email profile',
    authUrl: 'https://accounts.google.com/o/oauth2/auth'
  }
}

// API Configuration  
export const API_CONFIG = {
  baseUrl: 'http://localhost:8080/api',
  endpoints: {
    oauth: {
      callback: '/oauth/google/callback',
      link: '/oauth/google/link', 
      unlink: '/oauth/google/unlink',
      refresh: '/oauth/google/refresh',
      linkedAccounts: '/oauth/linked-accounts'
    }
  }
}

// Local Storage Keys
export const STORAGE_KEYS = {
  accessToken: 'workify_access_token',
  refreshToken: 'workify_refresh_token', 
  user: 'workify_user',
  googleAccessToken: 'google_access_token',
  oauthState: 'oauth_state',
  linkingMode: 'linking_mode'
}

export default {
  OAUTH_CONFIG,
  API_CONFIG,
  STORAGE_KEYS
}
