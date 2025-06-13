const Course = require("../models/Course")
const User = require("../models/User")
const Notification = require("../models/Notification")

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const query = {}

    // Filter courses based on user role
    if (req.user.role === "faculty") {
      query.instructor = req.user.userId
    } else if (req.user.role === "student") {
      query.students = req.user.userId
    }

    const courses = await Course.find(query)
      .populate("instructor", "name email")
      .populate("students", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
      .populate("instructor", "name email")
      .populate("students", "name email")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.status(200).json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { code, title, description, semester, year, credits } = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code })
    if (existingCourse) {
      return res.status(400).json({ message: "Course with this code already exists" })
    }

    const course = new Course({
      code,
      title,
      description,
      instructor: req.user.role === "faculty" ? req.user.userId : req.body.instructor,
      semester: semester || "Fall",
      year: year || new Date().getFullYear(),
      credits: credits || 3,
      students: [],
      materials: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await course.save()

    // Populate instructor details for response
    const populatedCourse = await Course.findById(course._id).populate("instructor", "name email")

    res.status(201).json(populatedCourse)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const { title, description, semester, year, credits } = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if faculty is the instructor of this course
    if (req.user.role === "faculty" && course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You are not authorized to update this course" })
    }

    // Update fields
    if (title) course.title = title
    if (description) course.description = description
    if (semester) course.semester = semester
    if (year) course.year = year
    if (credits) course.credits = credits

    course.updatedAt = new Date()

    await course.save()

    // Populate instructor details for response
    const populatedCourse = await Course.findById(course._id).populate("instructor", "name email")

    res.status(200).json(populatedCourse)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Enroll students in a course
exports.enrollStudents = async (req, res) => {
  try {
    const { courseId } = req.params
    const { studentIds } = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if faculty is the instructor of this course
    if (req.user.role === "faculty" && course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You are not authorized to enroll students in this course" })
    }

    // Verify all students exist and are actually students
    const students = await User.find({
      _id: { $in: studentIds },
      role: "student",
    })

    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: "One or more student IDs are invalid" })
    }

    // Add students to course
    for (const studentId of studentIds) {
      if (!course.students.includes(studentId)) {
        course.students.push(studentId)

        // Notify student
        await Notification.create({
          recipient: studentId,
          sender: req.user.userId,
          title: "Course Enrollment",
          message: `You have been enrolled in ${course.title}`,
          type: "system",
          relatedTo: {
            model: "Course",
            id: course._id,
          },
        })
      }
    }

    course.updatedAt = new Date()
    await course.save()

    // Populate student details for response
    const populatedCourse = await Course.findById(course._id)
      .populate("instructor", "name email")
      .populate("students", "name email")

    res.status(200).json({ message: "Students enrolled successfully", course: populatedCourse })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Add course material
exports.addCourseMaterial = async (req, res) => {
  try {
    const { courseId } = req.params
    const { title, description, fileUrl } = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if faculty is the instructor of this course
    if (req.user.role === "faculty" && course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You are not authorized to add materials to this course" })
    }

    const material = {
      title,
      description,
      fileUrl,
      uploadedAt: new Date(),
    }

    course.materials.push(material)
    course.updatedAt = new Date()

    await course.save()

    // Notify students
    for (const studentId of course.students) {
      await Notification.create({
        recipient: studentId,
        sender: req.user.userId,
        title: "New Course Material",
        message: `New material "${title}" has been added to ${course.title}`,
        type: "system",
        relatedTo: {
          model: "Course",
          id: course._id,
        },
      })
    }

    res.status(200).json({ message: "Material added successfully", material })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
