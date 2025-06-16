const mongoose = require("mongoose")

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personalInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      address: String,
      linkedin: String,
      github: String,
      website: String,
    },
    objective: String,
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: String,
        gpa: String,
        relevantCourses: [String],
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        duration: String,
        description: String,
        responsibilities: [String],
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: String,
        technologies: [String],
        link: String,
        githubLink: String,
      },
    ],
    skills: {
      programming: [String],
      frameworks: [String],
      databases: [String],
      tools: [String],
      languages: [String],
    },
    certifications: [String],
    achievements: [String],
    languages: [String],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Resume", ResumeSchema)
// This schema defines the structure of a resume document in MongoDB using Mongoose.