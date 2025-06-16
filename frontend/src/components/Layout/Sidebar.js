"use client"

import { useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import "./Sidebar.css"

// Import icons
import {
  FaTachometerAlt,
  FaBook,
  FaCalendarAlt,
  FaBell,
  FaClipboardList,
  FaUserCheck,
  FaTrophy,
  FaGraduationCap,
  FaCog,
  FaQuestionCircle,
  FaUser,
} from "react-icons/fa"

const Sidebar = ({ collapsed, toggleSidebar, visible = true }) => {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  // Define menu items based on user role
  const getMenuItems = () => {
    const studentItems = [
      { path: "/student/dashboard", name: "Dashboard", icon: <FaTachometerAlt />, category: "main" },
      { path: "/courses", name: "My Courses", icon: <FaBook />, category: "academic" },
      { path: "/assignments", name: "Assignments", icon: <FaClipboardList />, category: "academic" },
      { path: "/attendance", name: "Attendance", icon: <FaUserCheck />, category: "academic" },
      { path: "/events", name: "Events", icon: <FaCalendarAlt />, category: "campus" },
      { path: "/placements", name: "Placements", icon: <FaGraduationCap />, category: "career" },
      { path: "/achievements", name: "Achievements", icon: <FaTrophy />, category: "personal" },
      { path: "/notifications", name: "Notifications", icon: <FaBell />, category: "personal" },
    ]

    const settingsItems = [
      { path: "/profile", name: "Profile", icon: <FaUser />, category: "settings" },
      { path: "/settings", name: "Settings", icon: <FaCog />, category: "settings" },
      { path: "/help", name: "Help & Support", icon: <FaQuestionCircle />, category: "settings" },
    ]

    return { studentItems, settingsItems }
  }

  const { studentItems, settingsItems } = getMenuItems()

  // Check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {!collapsed && <div className="sidebar-overlay d-lg-none" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <div
        className={`professional-sidebar ${collapsed ? "collapsed" : "expanded"} ${!visible ? "sidebar-hidden" : ""}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-brand">
            
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content">
          {/* Main Navigation */}
          <div className="sidebar-section">
            {!collapsed && <div className="section-title">Navigation</div>}
            <ul className="sidebar-menu">
              {studentItems.map((item, index) => (
                <li key={`student-${index}`} className={`menu-item ${isActive(item.path) ? "active" : ""}`}>
                  <Link to={item.path} className="menu-link" title={collapsed ? item.name : ""}>
                    <span className="menu-icon">{item.icon}</span>
                    {!collapsed && <span className="menu-text">{item.name}</span>}
                    {isActive(item.path) && <div className="active-indicator"></div>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Settings Section */}
          <div className="sidebar-section">
            {!collapsed && <div className="section-title">Account</div>}
            <ul className="sidebar-menu">
              {settingsItems.map((item, index) => (
                <li key={`settings-${index}`} className={`menu-item ${isActive(item.path) ? "active" : ""}`}>
                  <Link to={item.path} className="menu-link" title={collapsed ? item.name : ""}>
                    <span className="menu-icon">{item.icon}</span>
                    {!collapsed && <span className="menu-text">{item.name}</span>}
                    {isActive(item.path) && <div className="active-indicator"></div>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <img src="/placeholder.svg?height=32&width=32" alt="User" />
              </div>
              <div className="user-details">
                <div className="user-name">{user?.name || "John Doe"}</div>
                <div className="user-role">Student</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar
