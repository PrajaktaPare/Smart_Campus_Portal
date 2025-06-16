const User = require("../models/User")

// Get user by ID
const getUserById = async (req, res) => {
  try {
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
}

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
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
}

// Delete user account
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const user = await User.findByIdAndDelete(req.params.userId || req.user._id)

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
}

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    if (!["admin", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const users = await User.find().select("-password")
    res.json({ success: true, data: users })
  } catch (error) {
    console.error("❌ Error fetching users:", error)
    res.status(500).json({ message: "Failed to fetch users" })
  }
}

// Get faculty by department
const getFaculty = async (req, res) => {
  try {
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
}

// Get students (faculty and admin only)
const getStudents = async (req, res) => {
  try {
    if (!["admin", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

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
}

module.exports = {
  getUserById,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  getFaculty,
  getStudents,
}
