const axios = require("axios")

const API_URL = "http://localhost:5000/api"

// Test function to check if endpoints exist
async function testEndpoints() {
  console.log("🧪 Testing Server Endpoints...\n")

  const endpoints = [
    { method: "GET", path: "/health", auth: false },
    { method: "GET", path: "/courses", auth: true },
    { method: "GET", path: "/courses/available", auth: true },
    { method: "GET", path: "/courses/enrolled", auth: true },
    { method: "GET", path: "/events", auth: true },
    { method: "GET", path: "/notifications", auth: true },
  ]

  // First, let's test the health endpoint
  try {
    const response = await axios.get(`${API_URL}/health`)
    console.log("✅ Health Check:", response.data)
  } catch (error) {
    console.log("❌ Health Check Failed:", error.message)
    console.log("🚨 Server might not be running on port 5000")
    return
  }

  // Test login to get a token
  let token = null
  try {
    console.log("\n🔐 Testing Login...")
    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: "test@example.com",
      password: "password123",
    })
    token = loginResponse.data.token
    console.log("✅ Login successful, got token")
  } catch (error) {
    console.log("❌ Login failed:", error.response?.data?.message || error.message)
    console.log("ℹ️  Will test endpoints without authentication")
  }

  // Test each endpoint
  for (const endpoint of endpoints) {
    if (endpoint.path === "/health") continue // Already tested

    try {
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${API_URL}${endpoint.path}`,
      }

      if (endpoint.auth && token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        }
      }

      const response = await axios(config)
      console.log(`✅ ${endpoint.method} ${endpoint.path}:`, response.status)
    } catch (error) {
      const status = error.response?.status || "No Response"
      const message = error.response?.data?.message || error.message
      console.log(`❌ ${endpoint.method} ${endpoint.path}:`, status, "-", message)
    }
  }

  console.log("\n📋 Test Complete!")
}

testEndpoints()
