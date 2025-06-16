const express = require("express")
const router = express.Router()
const {
  getProfile,
  updateProfile,
  updatePreferences,
  getPreferences,
  changePassword,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController")
const { verifyToken } = require("../controllers/authController")

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", verifyToken, getProfile)

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", verifyToken, updateProfile)

// @route   GET /api/users/preferences
// @desc    Get user preferences
// @access  Private
router.get("/preferences", verifyToken, getPreferences)

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put("/preferences", verifyToken, updatePreferences)

// @route   POST /api/users/change-password
// @desc    Change password
// @access  Private
router.post("/change-password", verifyToken, changePassword)

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get("/", verifyToken, getAllUsers)

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private
router.delete("/:id", verifyToken, deleteUser)

module.exports = router
