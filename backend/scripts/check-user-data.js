const mongoose = require("mongoose")
const User = require("../models/User")
require("dotenv").config()

const checkUserData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Find the user with email lion@gmail.com
    const user = await User.findOne({ email: "lion@gmail.com" })

    if (user) {
      console.log("👤 User found:")
      console.log("  - ID:", user._id)
      console.log("  - Name:", user.name)
      console.log("  - Email:", user.email)
      console.log("  - Role:", user.role)
      console.log("  - Full object:", JSON.stringify(user, null, 2))
    } else {
      console.log("❌ User not found with email: lion@gmail.com")

      // List all users
      const allUsers = await User.find({}).select("name email role")
      console.log("📋 All users in database:")
      allUsers.forEach((u) => {
        console.log(`  - ${u.email} (${u.role}) - ID: ${u._id}`)
      })
    }
  } catch (error) {
    console.error("💥 Error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

checkUserData()
