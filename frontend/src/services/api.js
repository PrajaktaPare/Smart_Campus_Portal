// Mock data for users
const mockUsers = [
  { _id: "1", name: "Admin User", email: "admin@edu.com", role: "admin" },
  { _id: "2", name: "Dr. Smith", email: "faculty@edu.com", role: "faculty" },
  { _id: "3", name: "John Doe", email: "student@edu.com", role: "student" },
  { _id: "4", name: "Jane Smith", email: "jane@edu.com", role: "student" },
  { _id: "5", name: "Bob Johnson", email: "bob@edu.com", role: "student" },
  { _id: "6", name: "Dr. Williams", email: "williams@edu.com", role: "faculty" },
]

// Mock data for courses
const mockCourses = [
  {
    _id: "101",
    code: "CS101",
    title: "Introduction to Computer Science",
    description: "A foundational course covering basic concepts in computer science.",
    instructor: { _id: "2", name: "Dr. Smith", email: "faculty@edu.com" },
    semester: "Fall",
    year: 2023,
    credits: 3,
    students: [
      { _id: "3", name: "John Doe", email: "student@edu.com" },
      { _id: "4", name: "Jane Smith", email: "jane@edu.com" },
    ],
  },
  {
    _id: "102",
    code: "CS201",
    title: "Data Structures",
    description: "Advanced course covering various data structures and their applications.",
    instructor: { _id: "2", name: "Dr. Smith", email: "faculty@edu.com" },
    semester: "Spring",
    year: 2023,
    credits: 4,
    students: [
      { _id: "3", name: "John Doe", email: "student@edu.com" },
      { _id: "5", name: "Bob Johnson", email: "bob@edu.com" },
    ],
  },
  {
    _id: "103",
    code: "CS301",
    title: "Database Systems",
    description: "Introduction to database design, implementation, and management.",
    instructor: { _id: "6", name: "Dr. Williams", email: "williams@edu.com" },
    semester: "Fall",
    year: 2023,
    credits: 3,
    students: [
      { _id: "4", name: "Jane Smith", email: "jane@edu.com" },
      { _id: "5", name: "Bob Johnson", email: "bob@edu.com" },
    ],
  },
]

// Mock data for grades
const mockGrades = [
  { _id: "g1", studentId: "3", course: "Introduction to Computer Science", grade: "A", semester: "Fall 2023" },
  { _id: "g2", studentId: "3", course: "Data Structures", grade: "B+", semester: "Spring 2023" },
  { _id: "g3", studentId: "4", course: "Introduction to Computer Science", grade: "A-", semester: "Fall 2023" },
  { _id: "g4", studentId: "4", course: "Database Systems", grade: "B", semester: "Fall 2023" },
  { _id: "g5", studentId: "5", course: "Data Structures", grade: "A", semester: "Spring 2023" },
  { _id: "g6", studentId: "5", course: "Database Systems", grade: "B+", semester: "Fall 2023" },
]

// Mock data for attendance
const mockAttendance = [
  {
    course: { _id: "101", code: "CS101", title: "Introduction to Computer Science" },
    totalClasses: 15,
    present: 14,
    absent: 1,
    percentage: 93,
  },
  {
    course: { _id: "102", code: "CS201", title: "Data Structures" },
    totalClasses: 12,
    present: 10,
    absent: 2,
    percentage: 83,
  },
]

// Mock data for assignments
const mockAssignments = [
  {
    _id: "a1",
    title: "Introduction to Programming",
    description: "Write a simple program to calculate factorial of a number",
    course: { _id: "101", code: "CS101", title: "Introduction to Computer Science" },
    dueDate: new Date(2023, 8, 30),
    totalMarks: 20,
    createdBy: { _id: "2", name: "Dr. Smith" },
    createdAt: new Date(2023, 8, 15),
    submission: null,
    status: "pending",
  },
  {
    _id: "a2",
    title: "Data Structures Implementation",
    description: "Implement a linked list with basic operations",
    course: { _id: "102", code: "CS201", title: "Data Structures" },
    dueDate: new Date(2023, 9, 15),
    totalMarks: 30,
    createdBy: { _id: "2", name: "Dr. Smith" },
    createdAt: new Date(2023, 9, 1),
    submission: {
      status: "submitted",
      submittedAt: new Date(2023, 9, 10),
      marks: 25,
    },
    status: "submitted",
  },
  {
    _id: "a3",
    title: "Database Design",
    description: "Design a database schema for a library management system",
    course: { _id: "103", code: "CS301", title: "Database Systems" },
    dueDate: new Date(2023, 10, 10),
    totalMarks: 25,
    createdBy: { _id: "6", name: "Dr. Williams" },
    createdAt: new Date(2023, 10, 1),
    submission: null,
    status: "pending",
  },
]

// Mock data for events
const mockEvents = [
  {
    _id: "e1",
    title: "Orientation Day",
    description: "Welcome orientation for new students",
    date: new Date(2023, 8, 15, 10, 0),
    location: "Main Auditorium",
    organizer: { _id: "1", name: "Admin User" },
    rsvped: true,
  },
  {
    _id: "e2",
    title: "Tech Symposium",
    description: "Annual technology symposium featuring guest speakers from industry",
    date: new Date(2023, 9, 20, 14, 0),
    location: "Conference Hall",
    organizer: { _id: "2", name: "Dr. Smith" },
    rsvped: false,
  },
  {
    _id: "e3",
    title: "Career Fair",
    description: "Meet representatives from top companies",
    date: new Date(2023, 10, 5, 9, 0),
    location: "Sports Complex",
    organizer: { _id: "6", name: "Dr. Williams" },
    rsvped: false,
  },
]

// Mock data for notifications
const mockNotifications = [
  {
    _id: "n1",
    title: "Assignment Due",
    message: "Reminder: Your CS101 assignment is due tomorrow",
    type: "assignment",
    sender: { _id: "2", name: "Dr. Smith" },
    read: false,
    createdAt: new Date(2023, 8, 29),
  },
  {
    _id: "n2",
    title: "Event Reminder",
    message: "Don't forget about the Orientation Day tomorrow",
    type: "event",
    sender: { _id: "1", name: "Admin User" },
    read: false,
    createdAt: new Date(2023, 8, 14),
  },
  {
    _id: "n3",
    title: "Grade Posted",
    message: "Your grade for CS201 has been posted",
    type: "grade",
    sender: { _id: "2", name: "Dr. Smith" },
    read: true,
    createdAt: new Date(2023, 7, 20),
  },
  {
    _id: "n4",
    title: "Course Enrollment",
    message: "You have been enrolled in Database Systems",
    type: "system",
    sender: { _id: "1", name: "Admin User" },
    read: true,
    createdAt: new Date(2023, 7, 15),
  },
  {
    _id: "n5",
    title: "Attendance Warning",
    message: "Your attendance in CS101 is below 85%",
    type: "attendance",
    sender: { _id: "2", name: "Dr. Smith" },
    read: false,
    createdAt: new Date(2023, 8, 10),
  },
]

// Mock data for announcements
const mockAnnouncements = [
  {
    _id: "an1",
    title: "Campus Closure",
    content: "Campus will be closed on October 10th for maintenance",
    createdAt: new Date(2023, 9, 5),
  },
  {
    _id: "an2",
    title: "New Library Hours",
    content: "The library will now be open 24/7 during exam week",
    createdAt: new Date(2023, 8, 20),
  },
  {
    _id: "an3",
    title: "Scholarship Applications",
    content: "Scholarship applications for the next academic year are now open",
    createdAt: new Date(2023, 8, 15),
  },
]

// Mock data for placements
const mockPlacements = [
  {
    _id: "p1",
    studentId: "3",
    studentName: "John Doe",
    company: "Google",
    role: "Software Engineer",
    status: "Placed",
  },
  {
    _id: "p2",
    studentId: "4",
    studentName: "Jane Smith",
    company: "Microsoft",
    role: "Data Scientist",
    status: "Interview",
  },
  {
    _id: "p3",
    studentId: "5",
    studentName: "Bob Johnson",
    company: "Amazon",
    role: "Product Manager",
    status: "Applied",
  },
]

// Mock API service
const mockAPI = {
  // Auth services
  login: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { email, password } = data
    const user = mockUsers.find((u) => u.email === email)

    if (!user || password !== "password") {
      throw { response: { data: { message: "Invalid email or password" } } }
    }

    return {
      data: {
        token: "mock-jwt-token",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    }
  },

  register: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { email } = data
    const existingUser = mockUsers.find((u) => u.email === email)

    if (existingUser) {
      throw { response: { data: { message: "User already exists" } } }
    }

    const newUser = {
      _id: `${mockUsers.length + 1}`,
      ...data,
    }

    mockUsers.push(newUser)

    return {
      data: {
        token: "mock-jwt-token",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    }
  },

  // User services
  getAllUsers: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockUsers }
  },

  getProfile: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = JSON.parse(localStorage.getItem("user"))
    const foundUser = mockUsers.find((u) => u.email === user.email)
    return { data: foundUser }
  },

  updateProfile: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = JSON.parse(localStorage.getItem("user"))
    const userIndex = mockUsers.findIndex((u) => u.email === user.email)

    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data }
      return { data: mockUsers[userIndex] }
    }

    throw { response: { data: { message: "User not found" } } }
  },

  getStudents: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockUsers.filter((u) => u.role === "student") }
  },

  getFaculty: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockUsers.filter((u) => u.role === "faculty") }
  },

  createUser: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { email } = data
    const existingUser = mockUsers.find((u) => u.email === email)

    if (existingUser) {
      throw { response: { data: { message: "User already exists" } } }
    }

    const newUser = {
      _id: `${mockUsers.length + 1}`,
      ...data,
    }

    mockUsers.push(newUser)
    return { data: newUser }
  },

  getUserById: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = mockUsers.find((u) => u._id === id)

    if (!user) {
      throw { response: { data: { message: "User not found" } } }
    }

    return { data: user }
  },

  updateUser: async (id, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const userIndex = mockUsers.findIndex((u) => u._id === id)

    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data }
      return { data: mockUsers[userIndex] }
    }

    throw { response: { data: { message: "User not found" } } }
  },

  deleteUser: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const userIndex = mockUsers.findIndex((u) => u._id === id)

    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1)
      return { data: { message: "User deleted successfully" } }
    }

    throw { response: { data: { message: "User not found" } } }
  },

  // Course services
  getCourses: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockCourses }
  },

  getAllCourses: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockCourses }
  },

  getCourse: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const course = mockCourses.find((c) => c._id === id)

    if (!course) {
      throw { response: { data: { message: "Course not found" } } }
    }

    return { data: course }
  },

  getCourseById: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const course = mockCourses.find((c) => c._id === id)

    if (!course) {
      throw { response: { data: { message: "Course not found" } } }
    }

    return { data: course }
  },

  createCourse: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { code } = data
    const existingCourse = mockCourses.find((c) => c.code === code)

    if (existingCourse) {
      throw { response: { data: { message: "Course with this code already exists" } } }
    }

    const user = JSON.parse(localStorage.getItem("user"))
    const instructor = mockUsers.find((u) => u.email === user.email)

    const newCourse = {
      _id: `${Number.parseInt(mockCourses[mockCourses.length - 1]._id) + 1}`,
      ...data,
      instructor: {
        _id: instructor._id,
        name: instructor.name,
        email: instructor.email,
      },
      students: [],
    }

    mockCourses.push(newCourse)
    return { data: newCourse }
  },

  updateCourse: async (id, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const courseIndex = mockCourses.findIndex((c) => c._id === id)

    if (courseIndex !== -1) {
      mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...data }
      return { data: mockCourses[courseIndex] }
    }

    throw { response: { data: { message: "Course not found" } } }
  },

  deleteCourse: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const courseIndex = mockCourses.findIndex((c) => c._id === id)

    if (courseIndex !== -1) {
      mockCourses.splice(courseIndex, 1)
      return { data: { message: "Course deleted successfully" } }
    }

    throw { response: { data: { message: "Course not found" } } }
  },

  enrollStudents: async (courseId, studentIds) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const courseIndex = mockCourses.findIndex((c) => c._id === courseId)

    if (courseIndex !== -1) {
      const students = mockUsers.filter((u) => studentIds.includes(u._id))
      mockCourses[courseIndex].students = students
      return { data: { message: "Students enrolled successfully", course: mockCourses[courseIndex] } }
    }

    throw { response: { data: { message: "Course not found" } } }
  },

  removeStudents: async (courseId, studentIds) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const courseIndex = mockCourses.findIndex((c) => c._id === courseId)

    if (courseIndex !== -1) {
      mockCourses[courseIndex].students = mockCourses[courseIndex].students.filter((s) => !studentIds.includes(s._id))
      return { data: { message: "Students removed successfully", course: mockCourses[courseIndex] } }
    }

    throw { response: { data: { message: "Course not found" } } }
  },

  addCourseMaterial: async (courseId, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const courseIndex = mockCourses.findIndex((c) => c._id === courseId)

    if (courseIndex !== -1) {
      if (!mockCourses[courseIndex].materials) {
        mockCourses[courseIndex].materials = []
      }

      const material = {
        _id: `m${mockCourses[courseIndex].materials.length + 1}`,
        ...data,
        uploadedAt: new Date(),
      }

      mockCourses[courseIndex].materials.push(material)
      return { data: { message: "Material added successfully", material } }
    }

    throw { response: { data: { message: "Course not found" } } }
  },

  // Event services
  getEvents: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockEvents }
  },

  getEvent: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const event = mockEvents.find((e) => e._id === id)

    if (!event) {
      throw { response: { data: { message: "Event not found" } } }
    }

    return { data: event }
  },

  createEvent: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = JSON.parse(localStorage.getItem("user"))
    const organizer = mockUsers.find((u) => u.email === user.email)

    const newEvent = {
      _id: `e${mockEvents.length + 1}`,
      ...data,
      organizer: {
        _id: organizer._id,
        name: organizer.name,
      },
      attendees: [],
      rsvped: false,
    }

    mockEvents.push(newEvent)
    return { data: newEvent }
  },

  updateEvent: async (id, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const eventIndex = mockEvents.findIndex((e) => e._id === id)

    if (eventIndex !== -1) {
      mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...data }
      return { data: mockEvents[eventIndex] }
    }

    throw { response: { data: { message: "Event not found" } } }
  },

  rsvpEvent: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const eventIndex = mockEvents.findIndex((e) => e._id === id)

    if (eventIndex !== -1) {
      mockEvents[eventIndex].rsvped = true
      return { data: { message: "RSVP successful", event: mockEvents[eventIndex] } }
    }

    throw { response: { data: { message: "Event not found" } } }
  },

  // Attendance services
  getStudentAttendance: async (studentId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockAttendance }
  },

  getStudentAttendanceStats: async (studentId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockAttendance }
  },

  getCourseAttendance: async (courseId, date) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const attendance = mockAttendance.find((a) => a.course._id === courseId)

    if (!attendance) {
      return { data: [] }
    }

    return { data: [attendance] }
  },

  markAttendance: async (courseId, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: { message: "Attendance marked successfully" } }
  },

  // Grade services
  getStudentGrades: async (studentId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockGrades.filter((g) => g.studentId === studentId) }
  },

  getCourseGrades: async (courseId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const course = mockCourses.find((c) => c._id === courseId)

    if (!course) {
      throw { response: { data: { message: "Course not found" } } }
    }

    return { data: mockGrades.filter((g) => g.course === course.title) }
  },

  addGrade: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newGrade = {
      _id: `g${mockGrades.length + 1}`,
      ...data,
    }

    mockGrades.push(newGrade)
    return { data: newGrade }
  },

  updateGrade: async (id, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const gradeIndex = mockGrades.findIndex((g) => g._id === id)

    if (gradeIndex !== -1) {
      mockGrades[gradeIndex] = { ...mockGrades[gradeIndex], ...data }
      return { data: mockGrades[gradeIndex] }
    }

    throw { response: { data: { message: "Grade not found" } } }
  },

  // Placement services
  getPlacements: async (studentId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockPlacements.filter((p) => p.studentId === studentId) }
  },

  getAllPlacements: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockPlacements }
  },

  createPlacement: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newPlacement = {
      _id: `p${mockPlacements.length + 1}`,
      ...data,
    }

    mockPlacements.push(newPlacement)
    return { data: newPlacement }
  },

  updatePlacement: async (id, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const placementIndex = mockPlacements.findIndex((p) => p._id === id)

    if (placementIndex !== -1) {
      mockPlacements[placementIndex] = { ...mockPlacements[placementIndex], ...data }
      return { data: mockPlacements[placementIndex] }
    }

    throw { response: { data: { message: "Placement not found" } } }
  },

  deletePlacement: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const placementIndex = mockPlacements.findIndex((p) => p._id === id)

    if (placementIndex !== -1) {
      mockPlacements.splice(placementIndex, 1)
      return { data: { message: "Placement deleted successfully" } }
    }

    throw { response: { data: { message: "Placement not found" } } }
  },

  // Notification services
  getUserNotifications: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockNotifications }
  },

  markAsRead: async (notificationId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const notificationIndex = mockNotifications.findIndex((n) => n._id === notificationId)

    if (notificationIndex !== -1) {
      mockNotifications[notificationIndex].read = true
      return { data: { message: "Notification marked as read" } }
    }

    throw { response: { data: { message: "Notification not found" } } }
  },

  markAllAsRead: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    mockNotifications.forEach((notification) => {
      notification.read = true
    })
    return { data: { message: "All notifications marked as read" } }
  },

  deleteNotification: async (notificationId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const notificationIndex = mockNotifications.findIndex((n) => n._id === notificationId)

    if (notificationIndex !== -1) {
      mockNotifications.splice(notificationIndex, 1)
      return { data: { message: "Notification deleted successfully" } }
    }

    throw { response: { data: { message: "Notification not found" } } }
  },

  createNotification: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = JSON.parse(localStorage.getItem("user"))
    const sender = mockUsers.find((u) => u.email === user.email)

    const newNotification = {
      _id: `n${mockNotifications.length + 1}`,
      ...data,
      sender: {
        _id: sender._id,
        name: sender.name,
      },
      read: false,
      createdAt: new Date(),
    }

    mockNotifications.push(newNotification)
    return { data: newNotification }
  },

  // Assignment services
  getAssignments: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockAssignments }
  },

  getAssignment: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const assignment = mockAssignments.find((a) => a._id === id)

    if (!assignment) {
      throw { response: { data: { message: "Assignment not found" } } }
    }

    return { data: assignment }
  },

  getCourseAssignments: async (courseId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockAssignments.filter((a) => a.course._id === courseId) }
  },

  getStudentAssignments: async (studentId) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockAssignments }
  },

  createAssignment: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = JSON.parse(localStorage.getItem("user"))
    const creator = mockUsers.find((u) => u.email === user.email)
    const course = mockCourses.find((c) => c._id === data.courseId)

    if (!course) {
      throw { response: { data: { message: "Course not found" } } }
    }

    const newAssignment = {
      _id: `a${mockAssignments.length + 1}`,
      title: data.title,
      description: data.description,
      course: {
        _id: course._id,
        code: course.code,
        title: course.title,
      },
      dueDate: data.dueDate,
      totalMarks: data.totalMarks,
      createdBy: {
        _id: creator._id,
        name: creator.name,
      },
      createdAt: new Date(),
      submissions: [],
      status: "pending",
    }

    mockAssignments.push(newAssignment)
    return { data: newAssignment }
  },

  submitAssignment: async (assignmentId, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const assignmentIndex = mockAssignments.findIndex((a) => a._id === assignmentId)

    if (assignmentIndex !== -1) {
      mockAssignments[assignmentIndex].submission = {
        status: "submitted",
        submittedAt: new Date(),
        content: data.content,
        attachments: data.attachments || [],
      }
      mockAssignments[assignmentIndex].status = "submitted"

      return { data: { message: "Assignment submitted successfully" } }
    }

    throw { response: { data: { message: "Assignment not found" } } }
  },

  gradeSubmission: async (assignmentId, submissionId, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const assignmentIndex = mockAssignments.findIndex((a) => a._id === assignmentId)

    if (assignmentIndex !== -1 && mockAssignments[assignmentIndex].submission) {
      mockAssignments[assignmentIndex].submission.marks = data.marks
      mockAssignments[assignmentIndex].submission.feedback = data.feedback
      mockAssignments[assignmentIndex].submission.status = "graded"
      mockAssignments[assignmentIndex].status = "graded"

      return { data: { message: "Submission graded successfully" } }
    }

    throw { response: { data: { message: "Assignment or submission not found" } } }
  },

  // Announcement services
  getAnnouncements: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: mockAnnouncements }
  },

  getAnnouncement: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const announcement = mockAnnouncements.find((a) => a._id === id)

    if (!announcement) {
      throw { response: { data: { message: "Announcement not found" } } }
    }

    return { data: announcement }
  },

  createAnnouncement: async (data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newAnnouncement = {
      _id: `an${mockAnnouncements.length + 1}`,
      ...data,
      createdAt: new Date(),
    }

    mockAnnouncements.push(newAnnouncement)
    return { data: newAnnouncement }
  },

  updateAnnouncement: async (id, data) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const announcementIndex = mockAnnouncements.findIndex((a) => a._id === id)

    if (announcementIndex !== -1) {
      mockAnnouncements[announcementIndex] = { ...mockAnnouncements[announcementIndex], ...data }
      return { data: mockAnnouncements[announcementIndex] }
    }

    throw { response: { data: { message: "Announcement not found" } } }
  },

  deleteAnnouncement: async (id) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const announcementIndex = mockAnnouncements.findIndex((a) => a._id === id)

    if (announcementIndex !== -1) {
      mockAnnouncements.splice(announcementIndex, 1)
      return { data: { message: "Announcement deleted successfully" } }
    }

    throw { response: { data: { message: "Announcement not found" } } }
  },
}

// Create a real-looking axios instance that uses our mock data
const instance = {
  get: (url) => {
    console.log(`Mock GET request to: ${url}`)
    return Promise.resolve({ data: [] })
  },
  post: (url, data) => {
    console.log(`Mock POST request to: ${url}`, data)
    return Promise.resolve({ data: {} })
  },
  put: (url, data) => {
    console.log(`Mock PUT request to: ${url}`, data)
    return Promise.resolve({ data: {} })
  },
  delete: (url) => {
    console.log(`Mock DELETE request to: ${url}`)
    return Promise.resolve({ data: {} })
  },
}

// Export the services
export const authService = {
  login: mockAPI.login,
  register: mockAPI.register,
}

export const userService = {
  getAllUsers: mockAPI.getAllUsers,
  getProfile: mockAPI.getProfile,
  updateProfile: mockAPI.updateProfile,
  getStudents: mockAPI.getStudents,
  getFaculty: mockAPI.getFaculty,
  createUser: mockAPI.createUser,
  getUserById: mockAPI.getUserById,
  updateUser: mockAPI.updateUser,
  deleteUser: mockAPI.deleteUser,
}

export const courseService = {
  getCourses: mockAPI.getCourses,
  getAllCourses: mockAPI.getAllCourses,
  getCourse: mockAPI.getCourse,
  getCourseById: mockAPI.getCourseById,
  createCourse: mockAPI.createCourse,
  updateCourse: mockAPI.updateCourse,
  deleteCourse: mockAPI.deleteCourse,
  enrollStudents: mockAPI.enrollStudents,
  removeStudents: mockAPI.removeStudents,
  addCourseMaterial: mockAPI.addCourseMaterial,
  getCourseAttendance: mockAPI.getCourseAttendance,
  markAttendance: mockAPI.markAttendance,
}

export const eventService = {
  getEvents: mockAPI.getEvents,
  getEvent: mockAPI.getEvent,
  createEvent: mockAPI.createEvent,
  updateEvent: mockAPI.updateEvent,
  deleteEvent: mockAPI.deleteEvent,
  rsvpEvent: mockAPI.rsvpEvent,
}

export const attendanceService = {
  getStudentAttendance: mockAPI.getStudentAttendance,
  getStudentAttendanceStats: mockAPI.getStudentAttendanceStats,
  getCourseAttendance: mockAPI.getCourseAttendance,
  markAttendance: mockAPI.markAttendance,
}

export const gradeService = {
  getStudentGrades: mockAPI.getStudentGrades,
  getCourseGrades: mockAPI.getCourseGrades,
  addGrade: mockAPI.addGrade,
  updateGrade: mockAPI.updateGrade,
}

export const placementService = {
  getPlacements: mockAPI.getPlacements,
  getAllPlacements: mockAPI.getAllPlacements,
  createPlacement: mockAPI.createPlacement,
  updatePlacement: mockAPI.updatePlacement,
  deletePlacement: mockAPI.deletePlacement,
}

export const notificationService = {
  getUserNotifications: mockAPI.getUserNotifications,
  markAsRead: mockAPI.markAsRead,
  markAllAsRead: mockAPI.markAllAsRead,
  deleteNotification: mockAPI.deleteNotification,
  createNotification: mockAPI.createNotification,
}

export const assignmentService = {
  getAssignments: mockAPI.getAssignments,
  getAssignment: mockAPI.getAssignment,
  getCourseAssignments: mockAPI.getCourseAssignments,
  getStudentAssignments: mockAPI.getStudentAssignments,
  createAssignment: mockAPI.createAssignment,
  submitAssignment: mockAPI.submitAssignment,
  gradeSubmission: mockAPI.gradeSubmission,
}

export const announcementService = {
  getAnnouncements: mockAPI.getAnnouncements,
  getAnnouncement: mockAPI.getAnnouncement,
  createAnnouncement: mockAPI.createAnnouncement,
  updateAnnouncement: mockAPI.updateAnnouncement,
  deleteAnnouncement: mockAPI.deleteAnnouncement,
}

export default instance
