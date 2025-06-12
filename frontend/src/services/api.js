import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const instance = axios.create({
  baseURL: API_BASE_URL,
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export const authService = {
  login: (data) => instance.post("/auth/login", data),
  register: (data) => instance.post("/auth/register", data),
}

export const userService = {
  getAllUsers: () => instance.get("/users"),
  getProfile: () => instance.get("/users/profile"),
  updateProfile: (data) => instance.put("/users/profile", data),
}

export const courseService = {
  getCourses: () => instance.get("/courses"),
  getCourse: (id) => instance.get(`/courses/${id}`),
}

export const eventService = {
  getEvents: () => instance.get("/events"),
  createEvent: (data) => instance.post("/events", data),
  rsvpEvent: (eventId) => instance.post(`/events/${eventId}/rsvp`),
  deleteEvent: (eventId) => instance.delete(`/events/${eventId}`),
}

export const attendanceService = {
  getAttendance: (studentId) => instance.get(`/attendance/${studentId}`),
}

export const gradeService = {
  getGrades: (studentId) => instance.get(`/grades/${studentId}`),
}

export const placementService = {
  getPlacements: (studentId) => instance.get(`/placements/${studentId}`),
  getAllPlacements: () => instance.get("/placements"),
  updatePlacement: (id, data) => instance.put(`/placements/${id}`, data),
}

export const notificationService = {
  getNotifications: (userId) => instance.get(`/notifications/${userId}`),
  markAsRead: (notificationId) => instance.put(`/notifications/${notificationId}/read`),
}

export const assignmentService = {
  getAssignments: () => instance.get("/assignments"),
  createAssignment: (data) => instance.post("/assignments", data),
  submitAssignment: (id, data) => instance.post(`/assignments/${id}/submit`, data),
}

export const announcementService = {
  getAnnouncements: () => instance.get("/announcements"),
  createAnnouncement: (data) => instance.post("/announcements", data),
}

export default instance
