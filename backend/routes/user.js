const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")

// Simple user routes without controller dependencies
console.log("👤 User routes loading...")

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    console.error("❌ Error fetching user profile:", error)
    res.status(500).json({ message: "Failed to fetch user profile" })
  }
})

// Get all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (!["admin", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const User = require("../models/User")
    const users = await User.find().select("-password")
    res.json({ success: true, data: users })
  } catch (error) {
    console.error("❌ Error fetching users:", error)
    res.status(500).json({ message: "Failed to fetch users" })
  }
})

// Get students only
router.get("/students", auth, async (req, res) => {
  try {
    if (!["admin", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const User = require("../models/User")
    const query = { role: "student" }

    // Faculty can only see students from their department
    if (req.user.role === "faculty") {
      query.department = req.user.department
    }

    const students = await User.find(query).select("-password")
    res.json({ success: true, data: students })
  } catch (error) {
    console.error("❌ Error fetching students:", error)
    res.status(500).json({ message: "Failed to fetch students" })
  }
})

// Get faculty only
router.get("/faculty", auth, async (req, res) => {
  try {
    const User = require("../models/User")
    const query = { role: "faculty" }

    // Filter by department if specified
    if (req.query.department) {
      query.department = req.query.department
    }

    const faculty = await User.find(query).select("-password")
    res.json({ success: true, data: faculty })
  } catch (error) {
    console.error("❌ Error fetching faculty:", error)
    res.status(500).json({ message: "Failed to fetch faculty" })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const User = require("../models/User")
    const { name, department } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, department },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("❌ Error updating profile:", error)
    res.status(500).json({ message: "Failed to update profile" })
  }
})

// Get user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const User = require("../models/User")
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Only allow users to see their own profile or admin/faculty to see others
    if (req.user._id.toString() !== req.params.id && !["admin", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({ success: true, user })
  } catch (error) {
    console.error("❌ Error fetching user:", error)
    res.status(500).json({ message: "Failed to fetch user" })
  }
})

// Delete user (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const User = require("../models/User")
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting user:", error)
    res.status(500).json({ message: "Failed to delete user" })
  }
})

console.log("✅ User routes loaded successfully")
module.exports = router
