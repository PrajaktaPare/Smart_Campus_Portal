// Test file to debug the controller import issue
const courseController = require("./controllers/courseController")

console.log("courseController:", courseController)
console.log("getAllCourses:", typeof courseController.getAllCourses)
console.log("Keys:", Object.keys(courseController))

// Test if the function exists
if (typeof courseController.getAllCourses === "function") {
  console.log("✅ getAllCourses is a function")
} else {
  console.log("❌ getAllCourses is not a function")
}
