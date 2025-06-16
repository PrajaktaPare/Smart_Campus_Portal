const Course = require("../models/Course")
const User = require("../models/User")

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    console.log("📚 Fetching courses for user:", req.user?.email, "Role:", req.user?.role)

    const courses = await Course.find()
      .populate("instructor", "name email department")
      .populate("students", "name email studentId")
      .sort({ createdAt: -1 })

    console.log("📊 Found", courses.length, "courses")
    res.status(200).json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
      .populate("instructor", "name email")
      .populate("students", "name email studentId")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.status(200).json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create new course
exports.createCourse = async (req, res) => {
  try {
    console.log("🆕 Creating course for user:", req.user?.email, "Role:", req.user?.role)
    console.log("📝 Course data received:", req.body)

    const { title, code, description, credits, semester, year, department } = req.body

    // Validate required fields
    if (!title || !code || !department) {
      return res.status(400).json({ message: "Title, code, and department are required" })
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() })
    if (existingCourse) {
      return res.status(400).json({ message: "Course code already exists" })
    }

    const courseData = {
      title: title.trim(),
      code: code.toUpperCase().trim(),
      description: description?.trim() || "",
      department: department.trim(),
      credits: Number.parseInt(credits) || 3,
      semester: semester || "Fall",
      year: Number.parseInt(year) || new Date().getFullYear(),
      students: [],
      isActive: true,
    }

    // Add instructor if user is faculty
    if (req.user && req.user.role === "faculty") {
      courseData.instructor = req.user.userId || req.user._id
    }

    const course = new Course(courseData)
    await course.save()

    const populatedCourse = await Course.findById(course._id).populate("instructor", "name email")

    console.log("✅ Course created successfully:", populatedCourse.title)
    res.status(201).json(populatedCourse)
  } catch (error) {
    console.error("❌ Error creating course:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const updates = req.body

    const course = await Course.findByIdAndUpdate(courseId, updates, {
      new: true,
      runValidators: true,
    }).populate("instructor", "name email")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.status(200).json(course)
  } catch (error) {
    console.error("Error updating course:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    const course = await Course.findByIdAndDelete(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.status(200).json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Enroll student in course
exports.enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params
    const { studentId } = req.body

    const course = await Course.findById(courseId)
    const student = await User.findById(studentId)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check if student is already enrolled
    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: "Student already enrolled in this course" })
    }

    course.students.push(studentId)
    await course.save()

    // Create comprehensive notifications
    try {
      const Notification = require("../models/Notification")

      // Notify the student
      await Notification.create({
        recipient: studentId,
        title: `Successfully Enrolled in ${course.title}`,
        message: `You have been enrolled in ${course.title} (${course.code}) taught by ${course.instructor?.name || "TBA"}. Welcome to the course!`,
        type: "enrollment",
        relatedTo: {
          model: "Course",
          id: courseId,
        },
      })

      // Notify the instructor
      if (course.instructor) {
        await Notification.create({
          recipient: course.instructor,
          title: `New Student Enrollment: ${course.title}`,
          message: `${student.name} (${student.email}) has enrolled in your course ${course.title} (${course.code}).`,
          type: "enrollment",
          relatedTo: {
            model: "Course",
            id: courseId,
          },
        })
      }

      // Notify other faculty in the same department
      const departmentFaculty = await User.find({
        role: "faculty",
        department: student.department,
        _id: { $ne: course.instructor },
      })

      const facultyNotifications = departmentFaculty.map((faculty) => ({
        recipient: faculty._id,
        title: `Department Enrollment Update`,
        message: `${student.name} enrolled in ${course.title} (${course.code}) in your department.`,
        type: "enrollment",
        relatedTo: {
          model: "Course",
          id: courseId,
        },
      }))

      if (facultyNotifications.length > 0) {
        await Notification.insertMany(facultyNotifications)
      }

      console.log(`✅ Created enrollment notifications for course ${course.title}`)
    } catch (notifError) {
      console.warn("Failed to create enrollment notifications:", notifError)
    }

    res.status(200).json({ message: "Student enrolled successfully" })
  } catch (error) {
    console.error("Error enrolling student:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Remove student from course
exports.removeStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.params

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    course.students = course.students.filter((id) => id.toString() !== studentId)
    await course.save()

    res.status(200).json({ message: "Student removed from course successfully" })
  } catch (error) {
    console.error("Error removing student:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get course students
exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params

    const course = await Course.findById(courseId).populate("students", "name email studentId")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.status(200).json(course.students)
  } catch (error) {
    console.error("Error fetching course students:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get available courses for enrollment - SIMPLIFIED VERSION
exports.getAvailableCourses = async (req, res) => {
  try {
    console.log("🔍 getAvailableCourses called")
    console.log("Query params:", req.query)
    console.log("User:", req.user?.email || "No user")

    const { department } = req.query

    // Build simple query
    const query = { isActive: { $ne: false } } // Get active courses

    if (department) {
      query.department = department
      console.log(`🎯 Filtering by department: ${department}`)
    }

    console.log("📊 MongoDB Query:", JSON.stringify(query))

    // Simple find without population first
    const courses = await Course.find(query).lean()

    console.log(`✅ Found ${courses.length} courses`)

    // Log first course for debugging
    if (courses.length > 0) {
      console.log("📝 Sample course:", {
        title: courses[0].title,
        code: courses[0].code,
        department: courses[0].department,
      })
    }

    res.status(200).json(courses)
  } catch (error) {
    console.error("❌ Error in getAvailableCourses:", error.message)
    console.error("Stack:", error.stack)
    res.status(500).json({
      message: "Error fetching available courses",
      error: error.message,
    })
  }
}
