const fs = require("fs")
const path = require("path")

console.log("🔍 Checking backend directory contents...")

const backendPath = path.join(__dirname, "..", "backend")

try {
  const files = fs.readdirSync(backendPath)

  console.log("\n📁 Files in backend directory:")
  files.forEach((file) => {
    const filePath = path.join(backendPath, file)
    const stats = fs.statSync(filePath)
    const type = stats.isDirectory() ? "📂" : "📄"
    console.log(`${type} ${file}`)
  })

  // Check for server files specifically
  const serverFiles = files.filter((file) => file.includes("server"))
  console.log("\n🖥️ Server files found:")
  if (serverFiles.length === 0) {
    console.log("❌ No server files found")
  } else {
    serverFiles.forEach((file) => console.log(`✅ ${file}`))
  }
} catch (error) {
  console.error("❌ Error reading backend directory:", error.message)
}
