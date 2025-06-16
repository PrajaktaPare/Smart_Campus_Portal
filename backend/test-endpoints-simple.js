const http = require("http")

const API_URL = "localhost"
const PORT = 5000

// Simple HTTP request function
function makeRequest(path, method = "GET", headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_URL,
      port: PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }

    const req = http.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          data: data,
        })
      })
    })

    req.on("error", (err) => {
      reject(err)
    })

    req.end()
  })
}

async function testEndpoints() {
  console.log("🧪 Testing Server Endpoints...\n")

  const endpoints = ["/health", "/courses", "/courses/available", "/events", "/notifications"]

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint)
      console.log(`✅ GET ${endpoint}: ${response.status}`)

      // Show some data for key endpoints
      if (endpoint === "/health") {
        console.log("   Response:", response.data)
      }
    } catch (error) {
      console.log(`❌ GET ${endpoint}: ${error.message}`)
    }
  }

  console.log("\n📋 Test Complete!")
  console.log("\n🎯 Next Steps:")
  console.log("1. Open your browser to http://localhost:3000")
  console.log("2. Login with: student@test.com / password123")
  console.log("3. Try the course enrollment feature")
}

testEndpoints()
