// Quick test script to check API connection
// Run this in browser console

const testAPI = async () => {
  console.log('🔍 Testing API connection...')
  
  // Check token
  const token = localStorage.getItem('workify_access_token')
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token found')
  
  if (!token) {
    console.error('❌ No authentication token found!')
    console.log('💡 Try logging in first')
    return
  }
  
  try {
    // Test tasks endpoint
    console.log('🔄 Testing /api/tasks...')
    const response = await fetch('http://localhost:8080/api/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Success! Data:', data)
    } else {
      const errorText = await response.text()
      console.error('❌ Error response:', errorText)
    }
  } catch (error) {
    console.error('❌ Network error:', error)
    console.log('💡 Is the backend server running on http://localhost:8080?')
  }
}

// Export for use
window.testAPI = testAPI

console.log('🚀 Test function loaded! Run testAPI() to test the connection')
