const { execSync } = require("child_process")
const os = require("os")

console.log("🔄 Installing MongoDB locally...")

try {
  const platform = os.platform()

  if (platform === "darwin") {
    // macOS
    console.log("📱 Detected macOS - Installing via Homebrew...")
    execSync("brew tap mongodb/brew", { stdio: "inherit" })
    execSync("brew install mongodb-community", { stdio: "inherit" })
    console.log("✅ MongoDB installed! Starting service...")
    execSync("brew services start mongodb-community", { stdio: "inherit" })
  } else if (platform === "win32") {
    // Windows
    console.log("🪟 Detected Windows - Please install MongoDB manually:")
    console.log("1. Download from: https://www.mongodb.com/try/download/community")
    console.log("2. Run the installer")
    console.log("3. Start MongoDB service from Services panel")
  } else {
    // Linux
    console.log("🐧 Detected Linux - Installing via package manager...")
    console.log("Please run the appropriate command for your distribution:")
    console.log("Ubuntu/Debian: sudo apt-get install mongodb")
    console.log("CentOS/RHEL: sudo yum install mongodb-org")
  }

  console.log("✅ MongoDB setup complete!")
  console.log("🔗 Connection string: mongodb://localhost:27017/smart_campus_portal")
} catch (error) {
  console.error("❌ Error installing MongoDB:", error.message)
  console.log("💡 Please install MongoDB manually from: https://docs.mongodb.com/manual/installation/")
}
