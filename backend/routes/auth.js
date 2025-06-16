const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { register, login, getMe, logout, updateProfile } = require("../controllers/authController")

console.log("🔐 Auth routes loaded")

// Public routes
router.post("/login", login)
router.post("/register", register)

// Protected routes
router.get("/me", auth, getMe)
router.post("/logout", auth, logout)
router.put("/profile", auth, updateProfile)

module.exports = router
