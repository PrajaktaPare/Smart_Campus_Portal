const Resume = require("../models/Resume")
const User = require("../models/User")

// Get user's resume
exports.getResume = async (req, res) => {
  try {
    const { userId } = req.params

    // Verify permissions
    if (req.user.role === "student" && req.user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const resume = await Resume.findOne({ user: userId }).populate("user", "name email phone")

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    res.status(200).json(resume)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create or update resume
exports.saveResume = async (req, res) => {
  try {
    const resumeData = req.body

    // Verify permissions
    if (req.user.role === "student" && req.user.userId !== resumeData.user) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    let resume = await Resume.findOne({ user: resumeData.user })

    if (resume) {
      // Update existing resume
      Object.assign(resume, resumeData)
      resume.lastUpdated = new Date()
      await resume.save()
    } else {
      // Create new resume
      resume = new Resume({
        ...resumeData,
        user: req.user.userId,
        lastUpdated: new Date(),
      })
      await resume.save()
    }

    const populatedResume = await Resume.findById(resume._id).populate("user", "name email phone")
    res.status(200).json(populatedResume)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Generate HTML resume for download
exports.generateHTML = async (req, res) => {
  try {
    const { userId } = req.params

    // Verify permissions
    if (req.user.role === "student" && req.user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const resume = await Resume.findOne({ user: userId }).populate("user", "name email phone")

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Generate HTML resume
    const htmlContent = generateResumeHTML(resume)

    res.setHeader("Content-Type", "text/html")
    res.setHeader("Content-Disposition", `attachment; filename="resume_${resume.user.name.replace(/\s+/g, "_")}.html"`)
    res.send(htmlContent)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Generate resume data for frontend PDF generation
exports.getResumeForPDF = async (req, res) => {
  try {
    const { userId } = req.params

    // Verify permissions
    if (req.user.role === "student" && req.user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const resume = await Resume.findOne({ user: userId }).populate("user", "name email phone")

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Return formatted resume data for frontend PDF generation
    res.status(200).json({
      ...resume.toObject(),
      downloadReady: true,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get all resumes (for admin)
exports.getAllResumes = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const resumes = await Resume.find().populate("user", "name email studentId").sort({ lastUpdated: -1 })

    res.status(200).json(resumes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params

    const resume = await Resume.findById(resumeId)
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Verify permissions
    if (req.user.role === "student" && resume.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    await Resume.findByIdAndDelete(resumeId)
    res.status(200).json({ message: "Resume deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Helper function to generate HTML resume
function generateResumeHTML(resume) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${resume.personalInfo.name}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 2.5em;
        }
        .contact-info {
            margin: 10px 0;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            color: #2c3e50;
            font-size: 1.4em;
            font-weight: bold;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .item {
            margin-bottom: 15px;
        }
        .item-title {
            font-weight: bold;
            color: #34495e;
        }
        .item-subtitle {
            color: #666;
            font-style: italic;
        }
        .item-description {
            margin-top: 5px;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        .skill-category {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
        }
        .skill-category strong {
            color: #2c3e50;
        }
        ul {
            margin: 5px 0;
            padding-left: 20px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${resume.personalInfo.name}</h1>
        <div class="contact-info">
            ${resume.personalInfo.email} | ${resume.personalInfo.phone}
            ${resume.personalInfo.address ? `<br>${resume.personalInfo.address}` : ""}
            ${resume.personalInfo.linkedin ? `<br>LinkedIn: ${resume.personalInfo.linkedin}` : ""}
            ${resume.personalInfo.github ? `<br>GitHub: ${resume.personalInfo.github}` : ""}
        </div>
    </div>

    ${
      resume.objective
        ? `
    <div class="section">
        <div class="section-title">OBJECTIVE</div>
        <p>${resume.objective}</p>
    </div>
    `
        : ""
    }

    ${
      resume.education && resume.education.length > 0
        ? `
    <div class="section">
        <div class="section-title">EDUCATION</div>
        ${resume.education
          .map(
            (edu) => `
        <div class="item">
            <div class="item-title">${edu.degree}</div>
            <div class="item-subtitle">${edu.institution} | ${edu.year}</div>
            ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ""}
            ${
              edu.relevantCourses && edu.relevantCourses.length > 0
                ? `<div>Relevant Courses: ${edu.relevantCourses.join(", ")}</div>`
                : ""
            }
        </div>
        `,
          )
          .join("")}
    </div>
    `
        : ""
    }

    ${
      resume.experience && resume.experience.length > 0
        ? `
    <div class="section">
        <div class="section-title">EXPERIENCE</div>
        ${resume.experience
          .map(
            (exp) => `
        <div class="item">
            <div class="item-title">${exp.title}</div>
            <div class="item-subtitle">${exp.company} | ${exp.duration}</div>
            <div class="item-description">${exp.description}</div>
        </div>
        `,
          )
          .join("")}
    </div>
    `
        : ""
    }

    ${
      resume.projects && resume.projects.length > 0
        ? `
    <div class="section">
        <div class="section-title">PROJECTS</div>
        ${resume.projects
          .map(
            (project) => `
        <div class="item">
            <div class="item-title">${project.title}</div>
            <div class="item-description">${project.description}</div>
            ${
              project.technologies && project.technologies.length > 0
                ? `<div><strong>Technologies:</strong> ${project.technologies.join(", ")}</div>`
                : ""
            }
            ${project.link ? `<div><strong>Link:</strong> <a href="${project.link}">${project.link}</a></div>` : ""}
        </div>
        `,
          )
          .join("")}
    </div>
    `
        : ""
    }

    ${
      resume.skills
        ? `
    <div class="section">
        <div class="section-title">TECHNICAL SKILLS</div>
        <div class="skills-grid">
            ${
              resume.skills.programming && resume.skills.programming.length > 0
                ? `
            <div class="skill-category">
                <strong>Programming Languages:</strong><br>
                ${resume.skills.programming.join(", ")}
            </div>
            `
                : ""
            }
            ${
              resume.skills.frameworks && resume.skills.frameworks.length > 0
                ? `
            <div class="skill-category">
                <strong>Frameworks & Libraries:</strong><br>
                ${resume.skills.frameworks.join(", ")}
            </div>
            `
                : ""
            }
            ${
              resume.skills.databases && resume.skills.databases.length > 0
                ? `
            <div class="skill-category">
                <strong>Databases:</strong><br>
                ${resume.skills.databases.join(", ")}
            </div>
            `
                : ""
            }
            ${
              resume.skills.tools && resume.skills.tools.length > 0
                ? `
            <div class="skill-category">
                <strong>Tools & Technologies:</strong><br>
                ${resume.skills.tools.join(", ")}
            </div>
            `
                : ""
            }
        </div>
    </div>
    `
        : ""
    }

    ${
      resume.certifications && resume.certifications.length > 0
        ? `
    <div class="section">
        <div class="section-title">CERTIFICATIONS</div>
        <ul>
            ${resume.certifications.map((cert) => `<li>${cert}</li>`).join("")}
        </ul>
    </div>
    `
        : ""
    }

    ${
      resume.achievements && resume.achievements.length > 0
        ? `
    <div class="section">
        <div class="section-title">ACHIEVEMENTS</div>
        <ul>
            ${resume.achievements.map((achievement) => `<li>${achievement}</li>`).join("")}
        </ul>
    </div>
    `
        : ""
    }
</body>
</html>
  `
}
