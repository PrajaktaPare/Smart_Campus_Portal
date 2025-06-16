const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
require("dotenv").config()

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Check if user already exists
    const existingUser = await User.findOne({ email: "lion@gmail.com" })
    if (existingUser) {
      console.log("👤 User already exists:", existingUser.email)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10)

    // Create the test user
    const testUser = new User({
      name: "Lion User",
      email: "lion@gmail.com",
      password: hashedPassword,
      role: "student",
      studentId: "STU999",
      year: 2,
      major: "Computer Science",
      phone: "555-9999",
      address: "123 Test Street, Test City, TC 12345",
    })

    await testUser.save()
    console.log("✅ Test user created successfully!")
    console.log("📧 Email:", testUser.email)
    console.log("🔑 Password: password123")
    console.log("👤 Role:", testUser.role)
    console.log("🆔 ID:", testUser._id)
  } catch (error) {
    console.error("💥 Error creating test user:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

createTestUser()
