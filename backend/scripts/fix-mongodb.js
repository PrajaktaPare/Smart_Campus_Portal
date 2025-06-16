const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing MongoDB connection...")

// Remove any cached environment variables
delete process.env.MONGODB_URI
delete process.env.MONGO_URI

// Check if .env file exists and fix it
const envPath = path.join(__dirname, "..", ".env")
const envContent = `# Database Configuration - LOCAL MONGODB ONLY
MONGODB_URI=mongodb://localhost:27017/smart_campus_portal
MONGO_URI=mongodb://localhost:27017/smart_campus_portal

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-smart-campus-portal-2024

# API Configuration
API_BASE_URL=http://localhost:5000/api
`

try {
  fs.writeFileSync(envPath, envContent)
  console.log("✅ .env file updated with local MongoDB URI")
} catch (error) {
  console.error("❌ Error updating .env file:", error.message)
}

// Check if MongoDB is running
const { exec } = require("child_process")

exec("mongod --version", (error, stdout, stderr) => {
  if (error) {
    console.log("❌ MongoDB is not installed or not in PATH")
    console.log("💡 Install MongoDB:")
    console.log("   macOS: brew install mongodb-community")
    console.log("   Windows: https://www.mongodb.com/try/download/community")
    console.log("   Linux: sudo apt install mongodb")
  } else {
    console.log("✅ MongoDB is installed")
    console.log("📋 Version:", stdout.trim())

    // Try to connect to MongoDB
    exec('mongo --eval "db.runCommand({connectionStatus : 1})"', (error, stdout, stderr) => {
      if (error) {
        console.log("❌ MongoDB is not running")
        console.log("💡 Start MongoDB:")
        console.log("   macOS: brew services start mongodb-community")
        console.log("   Windows: net start MongoDB")
        console.log("   Linux: sudo systemctl start mongodb")
      } else {
        console.log("✅ MongoDB is running and accessible")
      }
    })
  }
})

console.log("🔄 Please restart your backend server now!")
