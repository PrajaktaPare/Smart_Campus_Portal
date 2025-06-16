"use client"

import { useState, useEffect, useRef } from "react"
import "./AIAssistant.css"

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your Campus AI Assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const toggleAssistant = () => {
    setIsOpen(!isOpen)
  }

  const handleInputChange = (e) => {
    setInputText(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!inputText.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputText("")
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = generateResponse(inputText)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: aiResponse,
          sender: "ai",
          timestamp: new Date(),
        },
      ])
      setIsTyping(false)
    }, 1000)
  }

  const generateResponse = (query) => {
    // Simple rule-based responses
    query = query.toLowerCase()

    if (query.includes("next class") || query.includes("schedule")) {
      return "Your next class is CS301: Database Management Systems at 2:00 PM in Room 302."
    } else if (query.includes("assignment") || query.includes("deadline")) {
      return "You have an upcoming assignment for CS201: Data Structures due on October 25th."
    } else if (query.includes("event") || query.includes("upcoming")) {
      return "There are 3 upcoming events this week: Tech Symposium (Wednesday), Cultural Fest (Friday), and Career Fair (Saturday)."
    } else if (query.includes("attendance")) {
      return "Your current attendance is 85% across all courses. CS101 has the highest at 92% and CS301 has the lowest at 78%."
    } else if (query.includes("grade") || query.includes("marks")) {
      return "Your latest grades: CS101 Midterm: 85/100, CS201 Assignment: 92/100, CS301 Quiz: 78/100."
    } else if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      return "Hello! How can I assist you with your campus needs today?"
    } else if (query.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?"
    } else if (query.includes("bye") || query.includes("goodbye")) {
      return "Goodbye! Feel free to ask if you need any help later."
    } else {
      return "I'm not sure about that. You can ask me about your schedule, assignments, events, attendance, or grades."
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="ai-assistant">
      <button className={`assistant-toggle ${isOpen ? "open" : ""}`} onClick={toggleAssistant}>
        {isOpen ? "×" : "AI Assistant"}
      </button>

      {isOpen && (
        <div className="assistant-container">
          <div className="assistant-header">
            <div className="assistant-title">Campus AI Assistant</div>
            <button className="minimize-btn" onClick={toggleAssistant}>
              −
            </button>
          </div>

          <div className="assistant-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender === "ai" ? "ai" : "user"}`}>
                <div className="message-content">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            ))}

            {isTyping && (
              <div className="message ai typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="assistant-input" onSubmit={handleSubmit}>
            <input type="text" placeholder="Ask me anything..." value={inputText} onChange={handleInputChange} />
            <button type="submit">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>

          <div className="assistant-suggestions">
            <button onClick={() => setInputText("What's my next class?")}>Next class?</button>
            <button onClick={() => setInputText("Any upcoming assignments?")}>Assignments?</button>
            <button onClick={() => setInputText("Show my attendance")}>Attendance</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAssistant
