// Test script to verify profile update endpoint
import fetch from 'node-fetch';

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update Endpoint...\n');
  
  try {
    // First, try to get health status
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:4000/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
      return;
    }
    
    // Test profile update without auth (should fail)
    console.log('\n2. Testing profile update without auth (should fail)...');
    const noAuthResponse = await fetch('http://localhost:4000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        fullName: 'Test User',
        email: 'test@example.com'
      })
    });
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Correctly rejected unauthorized request');
    } else {
      console.log('⚠️  Unexpected response:', noAuthResponse.status);
    }
    
    console.log('\n3. To test with auth, you need to:');
    console.log('   - Sign in to the frontend app');
    console.log('   - Open browser console and check for profile update logs');
    console.log('   - Look for "=== PROFILE UPDATE REQUEST RECEIVED ===" in backend console');
    console.log('   - Check Network tab in browser dev tools for API calls');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileUpdate();