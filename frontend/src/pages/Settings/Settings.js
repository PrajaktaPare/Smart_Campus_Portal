"use client"

import { useState, useContext } from "react"
import AuthContext from "../../context/AuthContext"
import "./Settings.css"

const Settings = () => {
  const { user, updateProfile } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    phone: user?.phone || "123-456-7890",
    department: user?.department || "Computer Science",
    bio: user?.bio || "Student at Example University",
    profilePicture: user?.profilePicture || "https://via.placeholder.com/150",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    assignments: true,
    grades: true,
    events: true,
    announcements: true,
  })
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    fontSize: "medium",
    colorScheme: "blue",
    reducedMotion: false,
    highContrast: false,
  })
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: "everyone",
    showEmail: "faculty",
    showPhone: "none",
    activityStatus: true,
    allowTagging: true,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    })
  }

  const handleAppearanceChange = (e) => {
    const { name, value, type, checked } = e.target
    setAppearanceSettings({
      ...appearanceSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target
    setPrivacySettings({
      ...privacySettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update profile
      if (updateProfile) {
        await updateProfile(profileData)
      }

      setMessage({ text: "Profile updated successfully!", type: "success" })
    } catch (err) {
      setMessage({ text: "Failed to update profile. Please try again.", type: "error" })
    } finally {
      setLoading(false)

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 3000)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "Passwords do not match!", type: "error" })
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage({ text: "Password updated successfully!", type: "success" })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      setMessage({ text: "Failed to update password. Please try again.", type: "error" })
    } finally {
      setLoading(false)

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 3000)
    }
  }

  const handleNotificationSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage({ text: "Notification settings updated successfully!", type: "success" })
    } catch (err) {
      setMessage({ text: "Failed to update notification settings. Please try again.", type: "error" })
    } finally {
      setLoading(false)

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 3000)
    }
  }

  const handleAppearanceSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage({ text: "Appearance settings updated successfully!", type: "success" })
    } catch (err) {
      setMessage({ text: "Failed to update appearance settings. Please try again.", type: "error" })
    } finally {
      setLoading(false)

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 3000)
    }
  }

  const handlePrivacySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage({ text: "Privacy settings updated successfully!", type: "success" })
    } catch (err) {
      setMessage({ text: "Failed to update privacy settings. Please try again.", type: "error" })
    } finally {
      setLoading(false)

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 3000)
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>{message.text}</div>
      )}

      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="settings-nav">
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile Settings
            </button>
            <button
              className={`nav-item ${activeTab === "password" ? "active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              Change Password
            </button>
            <button
              className={`nav-item ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              Notifications
            </button>
            <button
              className={`nav-item ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
            >
              Appearance
            </button>
            <button
              className={`nav-item ${activeTab === "privacy" ? "active" : ""}`}
              onClick={() => setActiveTab("privacy")}
            >
              Privacy
            </button>
          </div>
        </div>

        <div className="settings-main">
          {activeTab === "profile" && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="profile-picture-section">
                  <div className="profile-picture">
                    <img src={profileData.profilePicture || "/placeholder.svg"} alt="Profile" />
                  </div>
                  <div className="profile-picture-actions">
                    <button type="button" className="btn btn-outline-primary">
                      Upload New Picture
                    </button>
                    <button type="button" className="btn btn-outline-danger">
                      Remove Picture
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="form-control"
                    value={profileData.department}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    className="form-control"
                    rows="4"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="settings-section">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="form-control"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li>At least 8 characters long</li>
                    <li>Contains at least one uppercase letter</li>
                    <li>Contains at least one lowercase letter</li>
                    <li>Contains at least one number</li>
                    <li>Contains at least one special character</li>
                  </ul>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <form onSubmit={handleNotificationSubmit}>
                <div className="settings-group">
                  <h3>Notification Channels</h3>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="email"
                      name="email"
                      className="form-check-input"
                      checked={notificationSettings.email}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="email">
                      Email Notifications
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="push"
                      name="push"
                      className="form-check-input"
                      checked={notificationSettings.push}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="push">
                      Push Notifications
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Notification Types</h3>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="assignments"
                      name="assignments"
                      className="form-check-input"
                      checked={notificationSettings.assignments}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="assignments">
                      Assignment Updates
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="grades"
                      name="grades"
                      className="form-check-input"
                      checked={notificationSettings.grades}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="grades">
                      Grade Updates
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="events"
                      name="events"
                      className="form-check-input"
                      checked={notificationSettings.events}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="events">
                      Event Reminders
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="announcements"
                      name="announcements"
                      className="form-check-input"
                      checked={notificationSettings.announcements}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="announcements">
                      Announcements
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Preferences"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="settings-section">
              <h2>Appearance Settings</h2>
              <form onSubmit={handleAppearanceSubmit}>
                <div className="settings-group">
                  <h3>Theme</h3>
                  <div className="theme-options">
                    <div className="theme-option">
                      <input
                        type="radio"
                        id="light"
                        name="theme"
                        value="light"
                        checked={appearanceSettings.theme === "light"}
                        onChange={handleAppearanceChange}
                      />
                      <label htmlFor="light" className="theme-label light-theme">
                        <div className="theme-preview"></div>
                        <span>Light</span>
                      </label>
                    </div>

                    <div className="theme-option">
                      <input
                        type="radio"
                        id="dark"
                        name="theme"
                        value="dark"
                        checked={appearanceSettings.theme === "dark"}
                        onChange={handleAppearanceChange}
                      />
                      <label htmlFor="dark" className="theme-label dark-theme">
                        <div className="theme-preview"></div>
                        <span>Dark</span>
                      </label>
                    </div>

                    <div className="theme-option">
                      <input
                        type="radio"
                        id="system"
                        name="theme"
                        value="system"
                        checked={appearanceSettings.theme === "system"}
                        onChange={handleAppearanceChange}
                      />
                      <label htmlFor="system" className="theme-label system-theme">
                        <div className="theme-preview"></div>
                        <span>System</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Font Size</h3>
                  <div className="form-group">
                    <select
                      name="fontSize"
                      className="form-control"
                      value={appearanceSettings.fontSize}
                      onChange={handleAppearanceChange}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="x-large">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Color Scheme</h3>
                  <div className="color-options">
                    <div className="color-option">
                      <input
                        type="radio"
                        id="blue"
                        name="colorScheme"
                        value="blue"
                        checked={appearanceSettings.colorScheme === "blue"}
                        onChange={handleAppearanceChange}
                      />
                      <label htmlFor="blue" className="color-label blue-color">
                        <div className="color-preview"></div>
                        <span>Blue</span>
                      </label>
                    </div>

                    <div className="color-option">
                      <input
                        type="radio"
                        id="green"
                        name="colorScheme"
                        value="green"
                        checked={appearanceSettings.colorScheme === "green"}
                        onChange={handleAppearanceChange}
                      />
                      <label htmlFor="green" className="color-label green-color">
                        <div className="color-preview"></div>
                        <span>Green</span>
                      </label>
                    </div>

                    <div className="color-option">
                      <input
                        type="radio"
                        id="purple"
                        name="colorScheme"
                        value="purple"
                        checked={appearanceSettings.colorScheme === "purple"}
                        onChange={handleAppearanceChange}
                      />
                      <label htmlFor="purple" className="color-label purple-color">
                        <div className="color-preview"></div>
                        <span>Purple</span>
                      </label>
                    </div>

                    <div className="color-option">
                      <input
                        type="radio"
                        id="orange"
                        name="colorScheme"
                        value="orange"
                        checked={appearanceSettings.colorScheme === "orange"}
                        onChange={handleAppearanceChange}
                      />
                      <label htmlFor="orange" className="color-label orange-color">
                        <div className="color-preview"></div>
                        <span>Orange</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Accessibility</h3>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="reducedMotion"
                      name="reducedMotion"
                      className="form-check-input"
                      checked={appearanceSettings.reducedMotion}
                      onChange={handleAppearanceChange}
                    />
                    <label className="form-check-label" htmlFor="reducedMotion">
                      Reduced Motion
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="highContrast"
                      name="highContrast"
                      className="form-check-input"
                      checked={appearanceSettings.highContrast}
                      onChange={handleAppearanceChange}
                    />
                    <label className="form-check-label" htmlFor="highContrast">
                      High Contrast
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Preferences"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              <form onSubmit={handlePrivacySubmit}>
                <div className="settings-group">
                  <h3>Profile Visibility</h3>
                  <div className="form-group">
                    <label htmlFor="showProfile">Who can see your profile?</label>
                    <select
                      id="showProfile"
                      name="showProfile"
                      className="form-control"
                      value={privacySettings.showProfile}
                      onChange={handlePrivacyChange}
                    >
                      <option value="everyone">Everyone</option>
                      <option value="students">Students Only</option>
                      <option value="faculty">Faculty Only</option>
                      <option value="none">No One</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="showEmail">Who can see your email?</label>
                    <select
                      id="showEmail"
                      name="showEmail"
                      className="form-control"
                      value={privacySettings.showEmail}
                      onChange={handlePrivacyChange}
                    >
                      <option value="everyone">Everyone</option>
                      <option value="students">Students Only</option>
                      <option value="faculty">Faculty Only</option>
                      <option value="none">No One</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="showPhone">Who can see your phone number?</label>
                    <select
                      id="showPhone"
                      name="showPhone"
                      className="form-control"
                      value={privacySettings.showPhone}
                      onChange={handlePrivacyChange}
                    >
                      <option value="everyone">Everyone</option>
                      <option value="students">Students Only</option>
                      <option value="faculty">Faculty Only</option>
                      <option value="none">No One</option>
                    </select>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Activity Settings</h3>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="activityStatus"
                      name="activityStatus"
                      className="form-check-input"
                      checked={privacySettings.activityStatus}
                      onChange={handlePrivacyChange}
                    />
                    <label className="form-check-label" htmlFor="activityStatus">
                      Show when you're active
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="allowTagging"
                      name="allowTagging"
                      className="form-check-input"
                      checked={privacySettings.allowTagging}
                      onChange={handlePrivacyChange}
                    />
                    <label className="form-check-label" htmlFor="allowTagging">
                      Allow others to tag you in posts
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Preferences"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
