"use client"

import { useState, useEffect, useContext } from "react"
import { useLocation } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import Footer from "./Footer"
import LoadingSpinner from "../UI/LoadingSpinner"
import "./MainLayout.css"

const MainLayout = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const location = useLocation()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992
      setIsMobile(mobile)

      if (mobile) {
        setSidebarCollapsed(true)
        setSidebarVisible(false)
      } else {
        setSidebarVisible(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle route changes
  useEffect(() => {
    setPageLoading(true)
    const timer = setTimeout(() => setPageLoading(false), 300)

    // Close mobile sidebar on route change
    if (isMobile) {
      setSidebarVisible(false)
    }

    return () => clearTimeout(timer)
  }, [location.pathname, isMobile])

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarVisible(false)
    }
  }

  if (authLoading) {
    return (
      <div className={`app-loading ${theme}`}>
        <LoadingSpinner size="large" message="Loading Smart Campus Portal..." />
      </div>
    )
  }

  return (
    <div className={`main-layout ${theme}`}>
      {/* Navigation Bar - Fixed at top */}
      <Navbar toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} user={user} />

      <div className="layout-body">
        {/* Sidebar - Fixed position */}
        <Sidebar
          collapsed={sidebarCollapsed}
          visible={sidebarVisible}
          toggleSidebar={toggleSidebar}
          onClose={closeMobileSidebar}
          user={user}
        />

        {/* Main Content Area */}
        <main className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
          {pageLoading ? (
            <div className="page-loading">
              <LoadingSpinner message="Loading page..." />
            </div>
          ) : (
            <div className="content-container">{children}</div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarVisible && <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>}

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  )
}

// Helper function to get page title from pathname
const getPageTitle = (pathname) => {
  const routes = {
    "/": "Home",
    "/dashboard": "Dashboard",
    "/student/dashboard": "Student Dashboard",
    "/faculty/dashboard": "Faculty Dashboard",
    "/admin/dashboard": "Admin Dashboard",
    "/courses": "Courses",
    "/assignments": "Assignments",
    "/attendance": "Attendance",
    "/events": "Events",
    "/placements": "Placements",
    "/notifications": "Notifications",
    "/profile": "Profile",
    "/settings": "Settings",
    "/help": "Help & Support",
    "/resume": "Resume Builder",
  }

  return routes[pathname] || "Page"
}

// Scroll to Top Button Component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button className={`scroll-to-top ${isVisible ? "visible" : ""}`} onClick={scrollToTop} aria-label="Scroll to top">
      <i className="fas fa-chevron-up"></i>
    </button>
  )
}

export default MainLayout
