"use client"

import { useState } from "react"
import "./Help.css"

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("getting-started")
  const [expandedFaqs, setExpandedFaqs] = useState([])

  const helpCategories = [
    { id: "getting-started", name: "Getting Started" },
    { id: "courses", name: "Courses & Assignments" },
    { id: "attendance", name: "Attendance" },
    { id: "events", name: "Events" },
    { id: "placements", name: "Placements" },
    { id: "account", name: "Account & Settings" },
  ]

  const faqData = {
    "getting-started": [
      {
        id: "gs1",
        question: "How do I navigate the dashboard?",
        answer:
          "The dashboard is your central hub for all activities. Use the sidebar navigation to access different sections like Courses, Assignments, Events, etc. The main area displays your personalized overview with upcoming deadlines, recent notifications, and quick access to frequently used features.",
      },
      {
        id: "gs2",
        question: "How do I update my profile information?",
        answer:
          "To update your profile information, go to Settings > Profile Settings. Here you can change your personal details, upload a profile picture, and update your bio. Don't forget to click 'Save Changes' after making your updates.",
      },
      {
        id: "gs3",
        question: "What should I do if I forgot my password?",
        answer:
          "If you forgot your password, click on the 'Forgot Password' link on the login page. Enter your registered email address, and you'll receive instructions to reset your password. Follow the link in the email to create a new password.",
      },
    ],
    courses: [
      {
        id: "c1",
        question: "How do I enroll in a course?",
        answer:
          "To enroll in a course, navigate to the Courses section, browse available courses, and click on the one you're interested in. On the course details page, click the 'Enroll' button. Some courses may require approval from the instructor before enrollment is confirmed.",
      },
      {
        id: "c2",
        question: "How do I submit an assignment?",
        answer:
          "To submit an assignment, go to the Assignments section or the specific course page. Click on the assignment you want to submit. On the assignment details page, click the 'Submit Assignment' button, upload your files, add any comments if needed, and click 'Submit'.",
      },
      {
        id: "c3",
        question: "Can I see my grades for assignments?",
        answer:
          "Yes, you can view your grades in the Assignments section. Each graded assignment will display your score. You can also see all your grades in the Courses section under each enrolled course, or in your Profile page under the Academic Performance section.",
      },
    ],
    attendance: [
      {
        id: "a1",
        question: "How is attendance marked?",
        answer:
          "Attendance is marked using the QR code system. Your instructor will generate a QR code during class, which you need to scan using the 'Scan QR Code' button in the Attendance section. Make sure you're physically present in the class as the QR codes are time-limited and may require location verification.",
      },
      {
        id: "a2",
        question: "How can I check my attendance record?",
        answer:
          "You can check your attendance record in the Attendance section. The calendar view shows your attendance status for each day, and the statistics panel displays your overall attendance percentage. You can filter by course and month to see specific attendance records.",
      },
      {
        id: "a3",
        question: "What should I do if my attendance was marked incorrectly?",
        answer:
          "If you believe your attendance was marked incorrectly, contact your instructor as soon as possible. Provide the date, course, and reason why you believe there's an error. The instructor can verify and correct the attendance record if necessary.",
      },
    ],
    events: [
      {
        id: "e1",
        question: "How do I RSVP for an event?",
        answer:
          "To RSVP for an event, go to the Events section and find the event you're interested in. Click on the event to view details, then click the 'RSVP' button. You'll receive a confirmation notification and the event will be added to your calendar.",
      },
      {
        id: "e2",
        question: "Can I add events to my calendar?",
        answer:
          "Yes, you can add events to your calendar. When viewing an event, click the 'Add to Calendar' button. You can choose to add it to your Google Calendar, Apple Calendar, or download an ICS file to import into any calendar application.",
      },
      {
        id: "e3",
        question: "How do I create an event?",
        answer:
          "Creating events is typically restricted to faculty and administrators. If you're a student organization leader who needs to create an event, contact your faculty advisor or the student affairs office for assistance.",
      },
    ],
    placements: [
      {
        id: "p1",
        question: "How do I apply for placement opportunities?",
        answer:
          "To apply for placement opportunities, go to the Placements section and browse available positions. Click on a position to view details, then click the 'Apply Now' button. You'll need to have your resume ready, which you can create using the Resume Builder tool in the Placements sidebar.",
      },
      {
        id: "p2",
        question: "How do I build my resume?",
        answer:
          "Use the Resume Builder tool in the Placements section. Click on 'Build Resume' in the sidebar, fill in your education, skills, experience, and projects information. You can preview your resume and download it as a PDF when finished.",
      },
      {
        id: "p3",
        question: "How can I prepare for placement interviews?",
        answer:
          "The Placements section offers resources for interview preparation. Look for the 'Interview Prep' section which includes common questions, tips for different types of interviews, and links to practice sessions. You can also check the Events section for upcoming mock interview workshops.",
      },
    ],
    account: [
      {
        id: "ac1",
        question: "How do I change my password?",
        answer:
          "To change your password, go to Settings > Change Password. Enter your current password, then enter and confirm your new password. Make sure your new password meets the security requirements displayed on the page.",
      },
      {
        id: "ac2",
        question: "How do I manage notification settings?",
        answer:
          "To manage notification settings, go to Settings > Notifications. Here you can choose which types of notifications you want to receive (assignments, grades, events, etc.) and through which channels (email, push notifications, etc.).",
      },
      {
        id: "ac3",
        question: "How do I change the appearance of the portal?",
        answer:
          "To change the appearance, go to Settings > Appearance. You can select between light and dark themes, adjust font size, choose a color scheme, and enable accessibility features like reduced motion or high contrast mode.",
      },
    ],
  }

  const toggleFaq = (faqId) => {
    if (expandedFaqs.includes(faqId)) {
      setExpandedFaqs(expandedFaqs.filter((id) => id !== faqId))
    } else {
      setExpandedFaqs([...expandedFaqs, faqId])
    }
  }

  const filteredFaqs = searchTerm
    ? Object.values(faqData)
        .flat()
        .filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    : faqData[activeCategory]

  return (
    <div className="help-container">
      <div className="help-header">
        <h1>Help Center</h1>
        <div className="help-search">
          <input
            type="text"
            placeholder="Search for help topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!searchTerm && (
        <div className="help-categories">
          {helpCategories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="help-content">
        {searchTerm ? (
          <>
            <h2>Search Results for "{searchTerm}"</h2>
            {filteredFaqs.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <p>No results found. Try different keywords or browse the categories.</p>
              </div>
            ) : (
              <div className="faq-list">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="faq-item">
                    <div
                      className={`faq-question ${expandedFaqs.includes(faq.id) ? "expanded" : ""}`}
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-toggle">{expandedFaqs.includes(faq.id) ? "−" : "+"}</span>
                    </div>
                    {expandedFaqs.includes(faq.id) && <div className="faq-answer">{faq.answer}</div>}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2>{helpCategories.find((cat) => cat.id === activeCategory).name}</h2>
            <div className="faq-list">
              {faqData[activeCategory].map((faq) => (
                <div key={faq.id} className="faq-item">
                  <div
                    className={`faq-question ${expandedFaqs.includes(faq.id) ? "expanded" : ""}`}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-toggle">{expandedFaqs.includes(faq.id) ? "−" : "+"}</span>
                  </div>
                  {expandedFaqs.includes(faq.id) && <div className="faq-answer">{faq.answer}</div>}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="help-contact">
          <h3>Still need help?</h3>
          <p>Contact our support team for personalized assistance.</p>
          <div className="contact-options">
            <button className="btn btn-primary">
              <i className="fas fa-envelope"></i> Email Support
            </button>
            <button className="btn btn-outline-primary">
              <i className="fas fa-comment"></i> Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
