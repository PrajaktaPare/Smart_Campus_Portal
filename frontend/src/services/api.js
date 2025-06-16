// frontend/src/services/api.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000" // Default to localhost if not set

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      }
}

export const authService = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    return response.json()
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }

    return response.json()
  },

  logout: () => {
    localStorage.removeItem("token")
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      return null
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user data")
    }

    return response.json()
  },

  updateProfile: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Failed to update profile")
    }

    return response.json()
  },

  changePassword: async (passwords) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(passwords),
    })

    if (!response.ok) {
      throw new Error("Failed to change password")
    }

    return response.json()
  },

  resetPasswordRequest: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error("Failed to request password reset")
    }

    return response.json()
  },

  resetPassword: async (token, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    })

    if (!response.ok) {
      throw new Error("Failed to reset password")
    }

    return response.json()
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token")
    return !!token
  },

  getToken: () => {
    return localStorage.getItem("token")
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error("Error parsing user data:", error)
      return null
    }
  },
}

export const userService = {
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    return response.json()
  },

  getUserById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }

    return response.json()
  },

  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Failed to create user")
    }

    return response.json()
  },

  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Failed to update user")
    }

    return response.json()
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete user")
    }

    return response.json()
  },

  getStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/students`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch students")
    }

    return response.json()
  },

  getFaculty: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/faculty`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch faculty")
    }

    return response.json()
  },
}

export const roleService = {
  getAllRoles: async () => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch roles")
    }

    return response.json()
  },

  getRoleById: async (roleId) => {
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch role")
    }

    return response.json()
  },

  createRole: async (roleData) => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData),
    })

    if (!response.ok) {
      throw new Error("Failed to create role")
    }

    return response.json()
  },

  updateRole: async (roleId, roleData) => {
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData),
    })

    if (!response.ok) {
      throw new Error("Failed to update role")
    }

    return response.json()
  },

  deleteRole: async (roleId) => {
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete role")
    }

    return response.json()
  },
}

export const permissionService = {
  getAllPermissions: async () => {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch permissions")
    }

    return response.json()
  },

  getPermissionById: async (permissionId) => {
    const response = await fetch(`${API_BASE_URL}/permissions/${permissionId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch permission")
    }

    return response.json()
  },

  createPermission: async (permissionData) => {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(permissionData),
    })

    if (!response.ok) {
      throw new Error("Failed to create permission")
    }

    return response.json()
  },

  updatePermission: async (permissionId, permissionData) => {
    const response = await fetch(`${API_BASE_URL}/permissions/${permissionId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(permissionData),
    })

    if (!response.ok) {
      throw new Error("Failed to update permission")
    }

    return response.json()
  },

  deletePermission: async (permissionId) => {
    const response = await fetch(`${API_BASE_URL}/permissions/${permissionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete permission")
    }

    return response.json()
  },
}

export const placementService = {
  // Get all placements
  getAllPlacements: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`${API_BASE_URL}/placements${queryString ? `?${queryString}` : ""}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch placements")
    }

    return response.json()
  },

  // Create new placement
  createPlacement: async (placementData) => {
    const response = await fetch(`${API_BASE_URL}/placements`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(placementData),
    })

    if (!response.ok) {
      throw new Error("Failed to create placement")
    }

    return response.json()
  },

  // Get placement by ID
  getPlacementById: async (placementId) => {
    const response = await fetch(`${API_BASE_URL}/placements/${placementId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch placement")
    }

    return response.json()
  },

  // Update placement
  updatePlacement: async (placementId, placementData) => {
    const response = await fetch(`${API_BASE_URL}/placements/${placementId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(placementData),
    })

    if (!response.ok) {
      throw new Error("Failed to update placement")
    }

    return response.json()
  },

  // Delete placement
  deletePlacement: async (placementId) => {
    const response = await fetch(`${API_BASE_URL}/placements/${placementId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete placement")
    }

    return response.json()
  },

  // Apply for placement
  applyForPlacement: async (placementId, applicationData) => {
    const response = await fetch(`${API_BASE_URL}/placements/${placementId}/apply`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(applicationData),
    })

    if (!response.ok) {
      throw new Error("Failed to apply for placement")
    }

    return response.json()
  },

  // Get placement applications
  getPlacementApplications: async (placementId) => {
    const response = await fetch(`${API_BASE_URL}/placements/${placementId}/applications`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch applications")
    }

    return response.json()
  },

  // Update application status
  updateApplicationStatus: async (applicationId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/placements/applications/${applicationId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error("Failed to update application status")
    }

    return response.json()
  },

  // Get student applications
  getStudentApplications: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/placements/student/${studentId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch student applications")
    }

    return response.json()
  },

  // Get placement statistics
  getPlacementStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/placements/statistics/overview`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch placement statistics")
    }

    return response.json()
  },
}

export const courseService = {
  getAllCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch courses")
    }

    return response.json()
  },

  getCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch courses")
    }

    return response.json()
  },

  getCourseById: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch course")
    }

    return response.json()
  },

  createCourse: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to create course")
    }

    const result = await response.json()
    return result.data || result
  },

  updateCourse: async (courseId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    })

    if (!response.ok) {
      throw new Error("Failed to update course")
    }

    return response.json()
  },

  deleteCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete course")
    }

    return response.json()
  },

  getAvailableCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses/available`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch available courses")
    }

    return response.json()
  },

  getStudentCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses/student`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch student courses")
    }

    return response.json()
  },

  enrollInCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll`, {
      method: "POST",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to enroll in course")
    }

    return response.json()
  },

  unenrollFromCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/unenroll`, {
      method: "POST",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to unenroll from course")
    }

    return response.json()
  },
}

export const eventService = {
  getEvents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch events")
    }

    return response.json()
  },

  getEventById: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch event")
    }

    return response.json()
  },

  createEvent: async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error("Failed to create event")
    }

    return response.json()
  },

  updateEvent: async (eventId, eventData) => {
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error("Failed to update event")
    }

    return response.json()
  },

  deleteEvent: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete event")
    }

    return response.json()
  },
}

export const assignmentService = {
  getAllAssignments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/assignments`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch assignments")
    }

    return response.json()
  },

  getAssignmentById: async (assignmentId) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch assignment")
    }

    return response.json()
  },

  createAssignment: async (assignmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/assignments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    })

    if (!response.ok) {
      throw new Error("Failed to create assignment")
    }

    return response.json()
  },

  getStudentAssignments: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/assignments`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch student assignments")
    }

    return response.json()
  },
}

export const attendanceService = {
  markAttendance: async (attendanceData) => {
    const response = await fetch(`${API_BASE_URL}/api/attendance`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(attendanceData),
    })

    if (!response.ok) {
      throw new Error("Failed to mark attendance")
    }

    return response.json()
  },

  getStudentAttendanceStats: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/attendance`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch attendance stats")
    }

    return response.json()
  },
}

export const gradeService = {
  getStudentGrades: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/grades`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch student grades")
    }

    return response.json()
  },
}

export const announcementService = {
  getAnnouncements: async () => {
    const response = await fetch(`${API_BASE_URL}/api/announcements`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch announcements")
    }

    return response.json()
  },

  createAnnouncement: async (announcementData) => {
    const response = await fetch(`${API_BASE_URL}/api/announcements`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(announcementData),
    })

    if (!response.ok) {
      throw new Error("Failed to create announcement")
    }

    return response.json()
  },

  deleteAnnouncement: async (announcementId) => {
    const response = await fetch(`${API_BASE_URL}/api/announcements/${announcementId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete announcement")
    }

    return response.json()
  },
}

export const notificationService = {
  createNotification: async (notificationData) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(notificationData),
    })

    if (!response.ok) {
      throw new Error("Failed to create notification")
    }

    return response.json()
  },

  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch notifications")
    }

    return response.json()
  },

  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to mark notification as read")
    }

    return response.json()
  },

  deleteNotification: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete notification")
    }

    return response.json()
  },
}
