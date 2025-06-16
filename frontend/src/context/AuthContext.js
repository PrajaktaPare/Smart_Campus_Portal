"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log("🔄 Initializing authentication...")

        // Check both localStorage and sessionStorage for token and user
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        const userDataLS = localStorage.getItem("user")
        const userDataSS = sessionStorage.getItem("user")

        let userData = null
        if (userDataLS) {
          userData = JSON.parse(userDataLS)
        } else if (userDataSS) {
          userData = JSON.parse(userDataSS)
        }

        console.log("🔍 Auth check - Token exists:", !!token)
        console.log("🔍 Auth check - User data:", userData)

        if (token && userData) {
          console.log("✅ User authenticated:", userData.email, userData.role)
          console.log("🆔 User ID available:", userData._id || userData.id || "MISSING")

          // Store in both for consistency
          localStorage.setItem("token", token)
          localStorage.setItem("user", JSON.stringify(userData))
          sessionStorage.setItem("token", token)
          sessionStorage.setItem("user", JSON.stringify(userData))

          setUser(userData)
          setIsAuthenticated(true)
        } else {
          console.log("❌ No valid authentication found")
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("💥 Auth initialization error:", error)
        // Clear invalid session data
        authService.logout()
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (userData, token) => {
    try {
      setLoading(true)
      console.log("🔐 AuthContext login called with:")
      console.log("  - User data:", userData)
      console.log("  - Token exists:", !!token)
      console.log("  - User ID:", userData?._id || userData?.id || "MISSING")

      if (userData && token) {
        // Ensure user has an ID field
        if (!userData._id && !userData.id) {
          console.warn("⚠️ User data missing ID field, attempting to fix...")
          if (userData.userId) {
            userData._id = userData.userId
          }
        }

        console.log("✅ Setting user and auth state")
        // Store in both localStorage and sessionStorage for redundancy
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(userData))
        sessionStorage.setItem("token", token)
        sessionStorage.setItem("user", JSON.stringify(userData))

        console.log("🆔 Final user ID:", userData._id || userData.id || "STILL MISSING")

        // Store in both localStorage and sessionStorage
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(userData))
        sessionStorage.setItem("token", token)
        sessionStorage.setItem("user", JSON.stringify(userData))

        setUser(userData)
        setIsAuthenticated(true)

        return { user: userData, token }
      } else {
        throw new Error("Invalid login data provided")
      }
    } catch (error) {
      console.error("❌ AuthContext login error:", error)
      setUser(null)
      setIsAuthenticated(false)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)

      if (response.user && response.token) {
        // Store in both localStorage and sessionStorage
        localStorage.setItem("token", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))
        sessionStorage.setItem("token", response.token)
        sessionStorage.setItem("user", JSON.stringify(response.user))

        setUser(response.user)
        setIsAuthenticated(true)
        return response
      } else {
        throw new Error("Invalid registration response")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setUser(null)
      setIsAuthenticated(false)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log("🚪 Logging out user:", user?.email)

    // Clear both localStorage and sessionStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")

    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    console.log("🔄 Updating user data:", userData.email)

    // Update both localStorage and sessionStorage
    localStorage.setItem("user", JSON.stringify(userData))
    sessionStorage.setItem("user", JSON.stringify(userData))

    setUser(userData)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
