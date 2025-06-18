# Smart Campus Portal

A comprehensive web-based platform designed to streamline academic and administrative processes in educational institutions. The Smart Campus Portal provides role-based access for students, faculty, and administrators with features including course management, assignment tracking, attendance monitoring, event management, and placement assistance.

## 🚀 Features

### For Students
- **Dashboard**: Personalized overview of courses, assignments, and upcoming events
- **Course Management**: View enrolled courses and browse available courses
- **Assignment Tracking**: Submit assignments and track deadlines
- **Attendance Monitoring**: View attendance records and statistics
- **Grade Management**: Access grades and performance analytics
- **Event Participation**: Browse and register for campus events
- **Resume Builder**: Create and manage professional resumes
- **Placement Tracking**: Monitor placement opportunities and applications
- **Notifications**: Real-time updates on academic activities

### For Faculty
- **Course Management**: Create and manage courses
- **Assignment Creation**: Design and distribute assignments
- **Attendance Tracking**: Mark and monitor student attendance
- **Grade Management**: Evaluate and grade student submissions
- **Event Organization**: Create and manage campus events
- **Student Analytics**: View student performance and progress
- **Communication**: Send notifications and announcements

### For Administrators
- **User Management**: Manage student and faculty accounts
- **Course Administration**: Oversee all courses and departments
- **System Analytics**: Monitor platform usage and performance
- **Event Oversight**: Manage all campus events and activities
- **Placement Coordination**: Oversee placement activities
- **System Configuration**: Configure platform settings and preferences

## 🛠️ Technologies Used

### Frontend
- **React.js** (v18.2.0) - User interface library
- **React Router DOM** (v6.8.1) - Client-side routing
- **Axios** (v1.3.4) - HTTP client for API requests
- **Chart.js** (v4.2.1) - Data visualization and charts
- **QR Code Generator** (v1.4.4) - QR code generation for attendance
- **React Toastify** (v9.1.1) - Toast notifications
- **CSS3** - Styling and responsive design
- **HTML5** - Markup language

### Backend
- **Node.js** (v18+) - JavaScript runtime environment
- **Express.js** (v4.18.2) - Web application framework
- **MongoDB** (v6.0+) - NoSQL database
- **Mongoose** (v7.0.3) - MongoDB object modeling
- **JWT** (jsonwebtoken v9.0.0) - Authentication and authorization
- **bcryptjs** (v2.4.3) - Password hashing
- **Multer** (v1.4.5) - File upload handling
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **dotenv** (v16.0.3) - Environment variable management

### Development Tools
- **npm** - Package manager
- **Nodemon** (v2.0.20) - Development server auto-restart
- **Concurrently** (v7.6.0) - Run multiple commands simultaneously

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher)
- **MongoDB** (version 6.0 or higher)
- **Git** (for version control)

## 🔧 Installation Instructions

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/your-username/smart-campus-portal.git
cd smart-campus-portal
\`\`\`

### 2. Backend Setup

#### Navigate to Backend Directory
\`\`\`bash
cd backend
\`\`\`

#### Install Dependencies
\`\`\`bash
npm install
\`\`\`

#### Environment Configuration
Create a \`.env\` file in the backend directory:
\`\`\`env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smart_campus_portal
MONGO_URI=mongodb://localhost:27017/smart_campus_portal

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
\`\`\`

#### Start MongoDB Service
\`\`\`bash
# On Windows
net start MongoDB

# On macOS (using Homebrew)
brew services start mongodb-community

#### Seed the Database
\`\`\`bash
# Run the comprehensive seeding script
node scripts/comprehensive-seed.js

# Or run individual seeding scripts
node scripts/create-sample-data.js
node scripts/seed-department-data.js
node scripts/create-sample-events.js
\`\`\`

#### Start Backend Server
\`\`\`bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
\`\`\`

The backend server will start on \`http://localhost:8000\`

### 3. Frontend Setup

#### Navigate to Frontend Directory
\`\`\`bash
cd ../frontend
\`\`\`

#### Install Dependencies
\`\`\`bash
npm install
\`\`\`

#### Environment Configuration
Create a \`.env\` file in the frontend directory:
\`\`\`env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_API_URL=http://localhost:8000

# Application Configuration
REACT_APP_APP_NAME=Smart Campus Portal
REACT_APP_VERSION=1.0.0
\`\`\`

#### Start Frontend Development Server
\`\`\`bash
npm start
\`\`\`

The frontend application will start on \`http://localhost:3001\`

### 4. Access the Application

Open your web browser and navigate to \`http://localhost:3001\`

#### Default Login Credentials

## 📁 Project Structure

\`\`\`
smart-campus-portal/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/              # Route controllers
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── assignmentController.js
│   │   ├── attendanceController.js
│   │   ├── gradeController.js
│   │   ├── eventController.js
│   │   ├── notificationController.js
│   │   ├── placementController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── models/                   # Database models
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Assignment.js
│   │   ├── Attendance.js
│   │   ├── Grade.js
│   │   ├── Event.js
│   │   ├── Notification.js
│   │   ├── Placement.js
│   │   └── Resume.js
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── assignments.js
│   │   ├── attendance.js
│   │   ├── events.js
│   │   ├── notifications.js
│   │   ├── placements.js
│   │   └── users.js
│   ├── scripts/                  # Database seeding scripts
│   │   ├── comprehensive-seed.js
│   │   ├── create-sample-data.js
│   │   └── seed-department-data.js
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js                 # Main server file
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Layout/
│   │   │   ├── Auth/
│   │   │   ├── Charts/
│   │   │   ├── UI/
│   │   │   └── QRCode/
│   │   ├── pages/                # Page components
│   │   │   ├── Dashboards/
│   │   │   ├── Courses/
│   │   │   ├── Assignments/
│   │   │   ├── Events/
│   │   │   ├── Attendance/
│   │   │   └── auth/
│   │   ├── context/              # React context providers
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── services/
│   │   │   └── api.js            # API service functions
│   │   ├── utils/
│   │   │   └── auth.js           # Authentication utilities
│   │   ├── App.js                # Main application component
│   │   └── index.js              # Application entry point
│   ├── .env                      # Environment variables
│   └── package.json
└── README.md                     # This file
\`\`\`

## 🔌 API Endpoints

### Authentication
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/logout\` - User logout
- \`GET /api/auth/verify\` - Verify JWT token

### Courses
- \`GET /api/courses\` - Get all courses
- \`POST /api/courses\` - Create new course
- \`GET /api/courses/:id\` - Get course by ID
- \`PUT /api/courses/:id\` - Update course
- \`DELETE /api/courses/:id\` - Delete course
- \`POST /api/courses/:id/enroll\` - Enroll in course

### Assignments
- \`GET /api/assignments\` - Get all assignments
- \`POST /api/assignments\` - Create new assignment
- \`GET /api/assignments/:id\` - Get assignment by ID
- \`PUT /api/assignments/:id\` - Update assignment
- \`DELETE /api/assignments/:id\` - Delete assignment
- \`POST /api/assignments/:id/submit\` - Submit assignment

### Attendance
- \`GET /api/attendance\` - Get attendance records
- \`POST /api/attendance\` - Mark attendance
- \`GET /api/attendance/course/:courseId\` - Get course attendance
- \`PUT /api/attendance/:id\` - Update attendance record

### Events
- \`GET /api/events\` - Get all events
- \`POST /api/events\` - Create new event
- \`GET /api/events/:id\` - Get event by ID
- \`PUT /api/events/:id\` - Update event
- \`DELETE /api/events/:id\` - Delete event
- \`POST /api/events/:id/register\` - Register for event

### Notifications
- \`GET /api/notifications\` - Get user notifications
- \`POST /api/notifications\` - Create notification
- \`PUT /api/notifications/:id/read\` - Mark as read
- \`DELETE /api/notifications/:id\` - Delete notification
- 
## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **Role-Based Access**: Different access levels for different user roles
- **Session Management**: Secure session handling

