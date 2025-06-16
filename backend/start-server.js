const { spawn } = require("child_process")
const path = require("path")

console.log("🚀 Starting Smart Campus Portal Server...\n")

// Check if server-working.js exists
const serverPath = path.join(__dirname, "server-working.js")
console.log("📁 Server file path:", serverPath)

// Start the server
const server = spawn("node", ["server-working.js"], {
  cwd: __dirname,
  stdio: "inherit",
})

server.on("error", (error) => {
  console.error("❌ Failed to start server:", error.message)
})

server.on("close", (code) => {
  console.log(`\n🛑 Server process exited with code ${code}`)
})

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...")
  server.kill("SIGINT")
  process.exit(0)
})

console.log("✅ Server starting...")
console.log("📍 Health check: http://localhost:5000/api/health")
console.log("📍 Available courses: http://localhost:5000/api/courses/available")
console.log("\nPress Ctrl+C to stop the server")
