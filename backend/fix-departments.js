const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")

// MongoDB Connection - Using your Atlas URI
const MONGO_URI =
  "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/smart_campus_portal?retryWrites=true&w=majority&appName=Cluster0"

console.log("🔄 Connecting to MongoDB Atlas...")
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully")
    fixStudentDepartments()
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// User Schema (same as in server-working.js)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    department: {
      type: String,
      default: "Computer Science",
    },
    studentId: { type: String },
    employeeId: { type: String },
    isFirstLogin: { type: Boolean, default: true },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model("User", userSchema)

const fixStudentDepartments = async () => {
  try {
    console.log("🔄 Checking and fixing student departments...")

    // Get current user count
    const totalUsers = await User.countDocuments()
    console.log(`📊 Total users in database: ${totalUsers}`)

    // Find users without departments
    const usersWithoutDepartment = await User.find({
      $or: [{ department: { $exists: false } }, { department: null }, { department: "" }],
    })

    console.log(`📊 Found ${usersWithoutDepartment.length} users without departments`)

    if (usersWithoutDepartment.length > 0) {
      // Assign default departments based on role
      for (const user of usersWithoutDepartment) {
        let defaultDepartment = "Computer Science"

        if (user.role === "admin") {
          defaultDepartment = "Administration"
        } else if (user.role === "faculty") {
          defaultDepartment = "Computer Science"
        } else if (user.role === "student") {
          defaultDepartment = "Computer Science"
        }

        await User.findByIdAndUpdate(user._id, { department: defaultDepartment })
        console.log(`✅ Updated ${user.name} (${user.role}) -> ${defaultDepartment}`)
      }
    }

    // Create some sample students in different departments
    const studentCount = await User.countDocuments({ role: "student" })
    console.log(`📊 Current student count: ${studentCount}`)

    if (studentCount < 5) {
      console.log("🔄 Creating sample students in different departments...")

      const hashedPassword = await bcryptjs.hash("student123", 12)

      const sampleStudents = [
        {
          name: "Alice Johnson",
          email: "alice.cs@example.com",
          password: hashedPassword,
          role: "student",
          department: "Computer Science",
          studentId: "CS2024002",
          isFirstLogin: false,
        },
        {
          name: "Bob Smith",
          email: "bob.math@example.com",
          password: hashedPassword,
          role: "student",
          department: "Mathematics",
          studentId: "MATH2024001",
          isFirstLogin: false,
        },
        {
          name: "Carol Davis",
          email: "carol.physics@example.com",
          password: hashedPassword,
          role: "student",
          department: "Physics",
          studentId: "PHY2024001",
          isFirstLogin: false,
        },
        {
          name: "David Wilson",
          email: "david.cs@example.com",
          password: hashedPassword,
          role: "student",
          department: "Computer Science",
          studentId: "CS2024003",
          isFirstLogin: false,
        },
        {
          name: "Eva Brown",
          email: "eva.chem@example.com",
          password: hashedPassword,
          role: "student",
          department: "Chemistry",
          studentId: "CHEM2024001",
          isFirstLogin: false,
        },
      ]

      for (const studentData of sampleStudents) {
        try {
          const existingStudent = await User.findOne({ email: studentData.email })
          if (!existingStudent) {
            const student = new User(studentData)
            await student.save()
            console.log(`✅ Created student: ${studentData.name} in ${studentData.department}`)
          } else {
            console.log(`⚠️ Student ${studentData.email} already exists`)
          }
        } catch (error) {
          console.log(`❌ Error creating student ${studentData.email}:`, error.message)
        }
      }
    }

    // Update existing faculty user to have proper department
    const facultyUser = await User.findOne({ email: "faculty@example.com" })
    if (facultyUser && !facultyUser.department) {
      await User.findByIdAndUpdate(facultyUser._id, { department: "Computer Science" })
      console.log("✅ Updated faculty user department")
    }

    // Display current department distribution
    const departmentStats = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    console.log("\n📊 Student Department Distribution:")
    if (departmentStats.length > 0) {
      departmentStats.forEach((stat) => {
        console.log(`   ${stat._id}: ${stat.count} students`)
      })
    } else {
      console.log("   No students found")
    }

    // Display all users for verification
    const allUsers = await User.find().select("name email role department")
    console.log("\n👥 All Users:")
    allUsers.forEach((user) => {
      console.log(`   ${user.name} (${user.email}) - ${user.role} - ${user.department}`)
    })

    console.log("\n✅ Student department fix completed!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error fixing student departments:", error)
    process.exit(1)
  }
}
