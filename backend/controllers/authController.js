const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log("📝 Registration attempt:", req.body)
    const { name, email, password, role, studentId, employeeId, department } = req.body

    // Validate input
    if (!name || !email || !password) {
      console.log("❌ Missing required fields")
      return res.status(400).json({ message: "Please enter all required fields" })
    }

    // Set default department if not provided
    const userDepartment = department || "Computer Science"

    // Check if user exists in database
    let user = await User.findOne({ email })
    if (user) {
      console.log("❌ User already exists:", email)
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user with proper defaults
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      department: userDepartment,
      studentId: studentId || `STU${Date.now().toString().slice(-6)}`,
      employeeId: employeeId || (role === "faculty" ? `FAC${Date.now().toString().slice(-6)}` : undefined),
      isFirstLogin: true,
      enrolledCourses: [],
    })

    console.log("💾 Saving user:", {
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      {
        expiresIn: "24h",
      },
    )

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      employeeId: user.employeeId,
      isFirstLogin: user.isFirstLogin,
      createdAt: user.createdAt,
    }

    console.log("✅ Registration successful:", user.email)

    res.status(201).json({
      token,
      user: userResponse,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("💥 Registration error:", error)
    res.status(500).json({ message: "Server error during registration: " + error.message })
  }
}

// @desc    Login user - Always check database
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log("🔐 Login attempt for:", req.body.email)
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password")
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Always fetch fresh user data from database
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      console.log("❌ User not found in database:", email)
      return res.status(401).json({ message: "Invalid credentials - user not found" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email)
      return res.status(401).json({ message: "Invalid credentials - wrong password" })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      {
        expiresIn: "24h",
      },
    )

    // Remove password from user object
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      employeeId: user.employeeId,
      isFirstLogin: user.isFirstLogin,
      enrolledCourses: user.enrolledCourses,
      createdAt: user.createdAt,
    }

    console.log("✅ Login successful for:", email, "Role:", user.role, "ID:", user._id)

    // Return consistent response structure
    res.json({
      token,
      user: userResponse,
      message: "Login successful",
    })
  } catch (error) {
    console.error("💥 Login error:", error)
    res.status(500).json({ message: "Server error during login: " + error.message })
  }
}

// @desc    Get current user data from database
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Always fetch fresh user data from database
    const user = await User.findById(req.userId).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get me error:", error.message)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // For JWT, we just send success response
    // Client should remove token from storage
    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ message: "Server error during logout" })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, department, studentId, employeeId } = req.body

    // Find user and update
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email
    if (department) user.department = department
    if (studentId) user.studentId = studentId
    if (employeeId) user.employeeId = employeeId

    await user.save()

    // Return updated user (without password)
    const updatedUser = await User.findById(req.userId).select("-password")
    res.json({
      user: updatedUser,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error during profile update" })
  }
}

module.exports = {
  register,
  login,
  getMe,
  logout,
  updateProfile,
}
