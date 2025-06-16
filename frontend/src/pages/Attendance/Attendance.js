"use client"

import { useState, useEffect, useContext } from "react"
import AuthContext from "../../context/AuthContext"
import "./Attendance.css"

const Attendance = () => {
  const { user } = useContext(AuthContext)
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [courses, setCourses] = useState([])
  const [qrCode, setQrCode] = useState(null)

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Mock data for now
        const mockCourses = [
          { _id: "101", code: "CS101", name: "Introduction to Computer Science" },
          { _id: "201", code: "CS201", name: "Data Structures and Algorithms" },
          { _id: "301", code: "CS301", name: "Database Management Systems" },
        ]

        const mockAttendance = [
          {
            _id: "1",
            course: mockCourses[0],
            date: "2023-10-05",
            status: "present",
            markedBy: "Dr. John Smith",
          },
          {
            _id: "2",
            course: mockCourses[0],
            date: "2023-10-07",
            status: "present",
            markedBy: "Dr. John Smith",
          },
          {
            _id: "3",
            course: mockCourses[0],
            date: "2023-10-12",
            status: "absent",
            markedBy: "Dr. John Smith",
          },
          {
            _id: "4",
            course: mockCourses[1],
            date: "2023-10-04",
            status: "present",
            markedBy: "Dr. Jane Doe",
          },
          {
            _id: "5",
            course: mockCourses[1],
            date: "2023-10-06",
            status: "present",
            markedBy: "Dr. Jane Doe",
          },
          {
            _id: "6",
            course: mockCourses[1],
            date: "2023-10-11",
            status: "present",
            markedBy: "Dr. Jane Doe",
          },
          {
            _id: "7",
            course: mockCourses[1],
            date: "2023-10-13",
            status: "absent",
            markedBy: "Dr. Jane Doe",
          },
          {
            _id: "8",
            course: mockCourses[2],
            date: "2023-10-03",
            status: "present",
            markedBy: "Prof. Robert Johnson",
          },
          {
            _id: "9",
            course: mockCourses[2],
            date: "2023-10-10",
            status: "absent",
            markedBy: "Prof. Robert Johnson",
          },
        ]

        setCourses(mockCourses)
        setAttendanceData(mockAttendance)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch attendance data")
        setLoading(false)
      }
    }

    fetchAttendanceData()
  }, [])

  const generateQRCode = () => {
    // Simulate QR code generation
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=attendance-${Date.now()}`)

    // Auto-expire QR code after 2 minutes
    setTimeout(() => {
      setQrCode(null)
    }, 120000)
  }

  const markAttendance = () => {
    // Simulate marking attendance via QR code
    alert("Attendance marked successfully!")
  }

  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[month]
  }

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getAttendanceForDay = (day, month, year, courseId) => {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

    const attendance = attendanceData.find((a) => {
      return a.date === dateString && (courseId === "all" || a.course._id === courseId)
    })

    return attendance ? attendance.status : null
  }

  const calculateAttendanceStats = () => {
    const filteredAttendance = attendanceData.filter((a) => selectedCourse === "all" || a.course._id === selectedCourse)

    const total = filteredAttendance.length
    const present = filteredAttendance.filter((a) => a.status === "present").length
    const absent = filteredAttendance.filter((a) => a.status === "absent").length

    const presentPercentage = total > 0 ? (present / total) * 100 : 0

    return {
      total,
      present,
      absent,
      presentPercentage: presentPercentage.toFixed(1),
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay()
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const attendance = getAttendanceForDay(day, selectedMonth, selectedYear, selectedCourse)
      let statusClass = ""

      if (attendance === "present") {
        statusClass = "present"
      } else if (attendance === "absent") {
        statusClass = "absent"
      }

      days.push(
        <div key={day} className={`calendar-day ${statusClass}`}>
          <div className="day-number">{day}</div>
          {attendance && <div className="day-status">{attendance === "present" ? "Present" : "Absent"}</div>}
        </div>,
      )
    }

    return days
  }

  const stats = calculateAttendanceStats()

  if (loading) return <div className="loading">Loading attendance data...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h1>Attendance</h1>
        {user && user.role === "faculty" && (
          <button className="btn btn-primary" onClick={generateQRCode}>
            Generate QR Code
          </button>
        )}
        {user && user.role === "student" && (
          <button className="btn btn-primary" onClick={markAttendance}>
            Scan QR Code
          </button>
        )}
      </div>

      {qrCode && (
        <div className="qr-code-container">
          <div className="qr-code-card">
            <h3>Attendance QR Code</h3>
            <p>Valid for 2 minutes</p>
            <div className="qr-code">
              <img src={qrCode || "/placeholder.svg"} alt="Attendance QR Code" />
            </div>
            <div className="qr-code-timer">
              <div className="timer-bar">
                <div className="timer-fill"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="attendance-controls">
        <div className="course-filter">
          <label htmlFor="course-select">Course:</label>
          <select
            id="course-select"
            className="form-control"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code}: {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="month-filter">
          <label htmlFor="month-select">Month:</label>
          <select
            id="month-select"
            className="form-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {getMonthName(i)}
              </option>
            ))}
          </select>
        </div>

        <div className="year-filter">
          <label htmlFor="year-select">Year:</label>
          <select
            id="year-select"
            className="form-control"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className="attendance-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Classes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.presentPercentage}%</div>
          <div className="stat-label">Attendance Rate</div>
        </div>
      </div>

      <div className="attendance-calendar">
        <div className="calendar-header">
          <h2>
            {getMonthName(selectedMonth)} {selectedYear}
          </h2>
        </div>
        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="calendar-days">{renderCalendar()}</div>
      </div>

      <div className="attendance-legend">
        <div className="legend-item">
          <div className="legend-color present"></div>
          <div className="legend-label">Present</div>
        </div>
        <div className="legend-item">
          <div className="legend-color absent"></div>
          <div className="legend-label">Absent</div>
        </div>
        <div className="legend-item">
          <div className="legend-color"></div>
          <div className="legend-label">No Class</div>
        </div>
      </div>
    </div>
  )
}

export default Attendance
