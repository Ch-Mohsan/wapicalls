// Test the calls API endpoint
import fetch from 'node-fetch';

async function testCallsAPI() {
  try {
    console.log("🔍 Testing calls API...");
    
    // Test without authentication first
    const response = await fetch('http://localhost:5000/api/calls');
    const data = await response.text();
    
    console.log("Response status:", response.status);
    console.log("Response body:", data);
    
    if (!response.ok) {
      console.log("❌ API call failed - likely authentication issue");
      console.log("This explains why frontend shows 'Unknown' data");
    }
    
  } catch (error) {
    console.error("❌ Error testing API:", error.message);
  }
}

testCallsAPI();
