"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

const NavigationContext = createContext()

export const NavigationProvider = ({ children }) => {
  const [navigationHistory, setNavigationHistory] = useState([])
  const location = useLocation()

  useEffect(() => {
    // Only add to history if it's a different page
    setNavigationHistory((prev) => {
      const currentPath = location.pathname
      const lastPath = prev[prev.length - 1]

      // Don't add if it's the same as the last entry
      if (currentPath !== lastPath) {
        const newHistory = [...prev, currentPath]
        console.log("📝 Navigation history updated:", newHistory)
        // Keep only last 10 entries to prevent memory issues
        return newHistory.slice(-10)
      }
      return prev
    })
  }, [location.pathname]) // Only track pathname changes

  const getPreviousPage = () => {
    if (navigationHistory.length >= 2) {
      // Get the second-to-last entry (previous page)
      return navigationHistory[navigationHistory.length - 2]
    }
    return null
  }

  const goToPreviousPage = (navigate, fallback = "/") => {
    const previousPage = getPreviousPage()
    const currentPage = location.pathname

    console.log("🔄 Current page:", currentPage)
    console.log("🔙 Previous page:", previousPage)
    console.log("📚 Full history:", navigationHistory)

    if (previousPage && previousPage !== currentPage) {
      console.log("✅ Navigating to previous page:", previousPage)
      navigate(previousPage)
    } else {
      console.log("🔄 Using browser back or fallback")
      if (window.history.length > 1) {
        window.history.back()
      } else {
        navigate(fallback)
      }
    }
  }

  return (
    <NavigationContext.Provider
      value={{
        navigationHistory,
        getPreviousPage,
        goToPreviousPage,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}
