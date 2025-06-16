const mongoose = require("mongoose")
const User = require("../models/User")
require("dotenv").config()

const fixUserDepartment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    const result = await User.findOneAndUpdate(
      { email: "lion@gmail.com" },
      {
        department: "Computer Science",
        studentId: "STU999",
        isFirstLogin: true,
      },
      { new: true }
    )

    if (result) {
      console.log("✅ Updated user:", result.email)
      console.log("🏫 Department:", result.department)
    } else {
      console.log("❌ User not found")
    }
  } catch (error) {
    console.error("💥 Error:", error)
  } finally {
    await mongoose.disconnect()
  }
}

fixUserDepartment()