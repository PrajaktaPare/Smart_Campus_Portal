const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const auth = require("../middleware/auth")

// Get all users (admin only)
router.get("/", auth, userController.getAllUsers)

// Get all students
router.get("/students", auth, userController.getStudents)

// Get all faculty
router.get("/faculty", auth, userController.getFaculty)

// Get user by ID
router.get("/:id", auth, userController.getUserById)

// Create a new user (admin only)
router.post("/", auth, userController.createUser)

// Update user
router.put("/:id", auth, userController.updateUser)

// Delete user (admin only)
router.delete("/:id", auth, userController.deleteUser)

// Get user profile
router.get("/profile", auth, userController.getProfile)

// Update user profile
router.put("/profile", auth, userController.updateProfile)

// Change password
router.put("/change-password", auth, userController.changePassword)

module.exports = router
