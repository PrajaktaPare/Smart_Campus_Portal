const { exec } = require("child_process")
const os = require("os")

console.log("🚀 Starting MongoDB...")

const platform = os.platform()

let startCommand
switch (platform) {
  case "darwin": // macOS
    startCommand = "brew services start mongodb-community"
    break
  case "win32": // Windows
    startCommand = "net start MongoDB"
    break
  case "linux": // Linux
    startCommand = "sudo systemctl start mongodb"
    break
  default:
    console.log("❌ Unsupported platform:", platform)
    process.exit(1)
}

console.log("💻 Platform:", platform)
console.log("🔧 Command:", startCommand)

exec(startCommand, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Error starting MongoDB:", error.message)
    console.log("💡 Try starting MongoDB manually:")
    console.log("   macOS: brew services start mongodb-community")
    console.log("   Windows: net start MongoDB")
    console.log("   Linux: sudo systemctl start mongodb")
  } else {
    console.log("✅ MongoDB started successfully")
    console.log(stdout)
  }
})
