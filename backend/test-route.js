const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

// Simple test route
app.get("/api/courses/test", (req, res) => {
  console.log("Test route hit")
  res.json({ message: "Test route working", query: req.query })
})

// Simple available courses route
app.get("/api/courses/available", (req, res) => {
  console.log("Available courses route hit")
  console.log("Query:", req.query)

  const testCourses = [
    {
      _id: "1",
      title: "Introduction to Programming",
      code: "CS101",
      department: "Computer Science",
      credits: 3,
    },
    {
      _id: "2",
      title: "Data Structures",
      code: "CS201",
      department: "Computer Science",
      credits: 4,
    },
    {
      _id: "3",
      title: "Calculus I",
      code: "MATH101",
      department: "Mathematics",
      credits: 4,
    },
  ]

  const { department } = req.query
  let filteredCourses = testCourses

  if (department) {
    filteredCourses = testCourses.filter((course) => course.department === department)
    console.log(`Filtered by ${department}: ${filteredCourses.length} courses`)
  }

  res.json(filteredCourses)
})

const PORT = 5001
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`)
  console.log(`Test: http://localhost:${PORT}/api/courses/test`)
  console.log(`Available: http://localhost:${PORT}/api/courses/available?department=Computer%20Science`)
})
