const { exec } = require("child_process")
const os = require("os")

console.log("🔧 Installing and starting MongoDB locally...")

const platform = os.platform()
console.log("💻 Detected platform:", platform)

let installCommand, startCommand

switch (platform) {
  case "darwin": // macOS
    installCommand = "brew tap mongodb/brew && brew install mongodb-community"
    startCommand = "brew services start mongodb-community"
    break
  case "win32": // Windows
    console.log("💡 For Windows:")
    console.log("1. Download MongoDB from: https://www.mongodb.com/try/download/community")
    console.log("2. Run the installer")
    console.log("3. Start MongoDB service: net start MongoDB")
  // return statement removed because it is outside a function
  case "linux": // Linux
    installCommand = "sudo apt update && sudo apt install -y mongodb"
    startCommand = "sudo systemctl start mongodb && sudo systemctl enable mongodb"
    break
  default:
    console.log("❌ Unsupported platform:", platform)
    return
}

console.log("🔧 Installing MongoDB...")
exec(installCommand, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Installation error:", error.message)
    console.log("💡 Please install MongoDB manually:")
    console.log("   macOS: brew install mongodb-community")
    console.log("   Linux: sudo apt install mongodb")
    return
  }

  console.log("✅ MongoDB installed successfully")
  console.log("🚀 Starting MongoDB...")

  exec(startCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Start error:", error.message)
      console.log("💡 Please start MongoDB manually:")
      console.log("   macOS: brew services start mongodb-community")
      console.log("   Linux: sudo systemctl start mongodb")
      return
    }

    console.log("✅ MongoDB started successfully")
    console.log("🎉 Now restart your backend server!")
  })
})
