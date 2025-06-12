const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Event = require('./models/Event');
const Placement = require('./models/Placement');
const Notification = require('./models/Notification');
const Attendance = require('./models/Attendance');
const Grade = require('./models/Grade');
const Announcement = require('./models/Announcement');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Event.deleteMany({}),
      Placement.deleteMany({}),
      Notification.deleteMany({}),
      Attendance.deleteMany({}),
      Grade.deleteMany({}),
      Announcement.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('student123', salt);

    // Seed Users
    const users = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Demo Student',
        email: 'student@example.com',
        password: hashedPassword,
        role: 'student',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Demo Faculty',
        email: 'faculty@example.com',
        password: hashedPassword,
        role: 'faculty',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Demo Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    ];
    await User.insertMany(users);
    console.log('Seeded users');

    const student = users.find(u => u.role === 'student');
    const faculty = users.find(u => u.role === 'faculty');

    // Seed Courses
    const courses = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Introduction to Programming',
        instructor: faculty.name,
        students: [student._id],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Data Structures',
        instructor: faculty.name,
        students: [student._id],
      },
    ];
    await Course.insertMany(courses);
    console.log('Seeded courses');

    // Seed Events
    const events = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Tech Workshop',
        description: 'A workshop on modern technologies',
        date: new Date('2025-06-15'),
        createdBy: faculty._id,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Career Fair',
        description: 'Meet top companies',
        date: new Date('2025-06-20'),
        createdBy: faculty._id,
      },
    ];
    await Event.insertMany(events);
    console.log('Seeded events');

    // Seed Placements
    const placements = [
      {
        _id: new mongoose.Types.ObjectId(),
        studentId: student._id,
        studentName: student.name,
        company: 'Tech Corp',
        role: 'Software Engineer',
        status: 'Applied',
      },
    ];
    await Placement.insertMany(placements);
    console.log('Seeded placements');

    // Seed Notifications
    const notifications = [
      {
        _id: new mongoose.Types.ObjectId(),
        userId: student._id,
        message: 'New event: Tech Workshop',
        read: false,
      },
    ];
    await Notification.insertMany(notifications);
    console.log('Seeded notifications');

    // Seed Attendance
    const attendance = [
      {
        _id: new mongoose.Types.ObjectId(),
        studentId: student._id,
        course: courses[0].title,
        percentage: 85,
      },
    ];
    await Attendance.insertMany(attendance);
    console.log('Seeded attendance');

    // Seed Grades
    const grades = [
      {
        _id: new mongoose.Types.ObjectId(),
        studentId: student._id,
        course: courses[0].title,
        grade: 'A',
        semester: 'Spring 2025',
      },
    ];
    await Grade.insertMany(grades);
    console.log('Seeded grades');

    // Seed Announcements
    const announcements = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Campus Closure',
        content: 'Campus will be closed on June 15, 2025.',
        createdAt: new Date(),
      },
    ];
    await Announcement.insertMany(announcements);
    console.log('Seeded announcements');

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedDatabase();
