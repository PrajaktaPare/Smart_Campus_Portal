"use client"

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import "./QRAttendance.css"

const QRAttendance = ({ isOpen, onClose, courseId, courseName }) => {
  const [qrValue, setQrValue] = useState("")
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [mode, setMode] = useState("generate") // "generate" or "scan"
  const videoRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isOpen && mode === "generate") {
      // Generate a unique QR code value
      const timestamp = new Date().getTime()
      const randomString = Math.random().toString(36).substring(2, 10)
      const newQrValue = `attendance-${courseId}-${timestamp}-${randomString}`
      setQrValue(newQrValue)

      // Reset timer
      setTimeLeft(120)

      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Close camera if open
      if (isCameraOpen) {
        stopCamera()
      }
    }
  }, [isOpen, mode, courseId])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const regenerateQR = () => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Generate new QR code
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 10)
    const newQrValue = `attendance-${courseId}-${timestamp}-${randomString}`
    setQrValue(newQrValue)

    // Reset timer
    setTimeLeft(120)

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
        setScanError(null)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setScanError("Failed to access camera. Please make sure you've granted camera permissions.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraOpen(false)
    }
  }

  const handleScan = () => {
    // In a real app, this would use a QR code scanning library
    // For this demo, we'll simulate a successful scan

    setTimeout(() => {
      const success = Math.random() > 0.2 // 80% chance of success

      if (success) {
        setScanResult({
          success: true,
          message: "Attendance marked successfully!",
          timestamp: new Date().toLocaleString(),
        })
      } else {
        setScanResult({
          success: false,
          message: "Invalid or expired QR code.",
          timestamp: new Date().toLocaleString(),
        })
      }

      stopCamera()
    }, 2000)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setScanResult(null)
    setScanError(null)

    if (newMode === "scan") {
      startCamera()
    } else if (isCameraOpen) {
      stopCamera()
    }
  }

  if (!isOpen) return null

  return (
    <div className="qr-attendance-overlay">
      <div className="qr-attendance-modal">
        <div className="qr-modal-header">
          <h3>{mode === "generate" ? "Generate Attendance QR Code" : "Scan Attendance QR Code"}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="qr-modal-tabs">
          <button className={`tab-btn ${mode === "generate" ? "active" : ""}`} onClick={() => switchMode("generate")}>
            Generate QR
          </button>
          <button className={`tab-btn ${mode === "scan" ? "active" : ""}`} onClick={() => switchMode("scan")}>
            Scan QR
          </button>
        </div>

        <div className="qr-modal-content">
          {mode === "generate" ? (
            <div className="qr-generator">
              <div className="course-info">
                <span className="course-name">{courseName || "Course Name"}</span>
                <span className="course-id">ID: {courseId || "Course ID"}</span>
              </div>

              <div className="qr-container">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              <div className="qr-timer">
                <div className="timer-display">
                  <span className="timer-value">{formatTime(timeLeft)}</span>
                  <span className="timer-label">remaining</span>
                </div>
                <div className="timer-bar">
                  <div className="timer-progress" style={{ width: `${(timeLeft / 120) * 100}%` }}></div>
                </div>
              </div>

              <div className="qr-actions">
                <button className="btn btn-primary" onClick={regenerateQR} disabled={timeLeft > 0}>
                  {timeLeft > 0 ? "Regenerate in " + formatTime(timeLeft) : "Generate New QR Code"}
                </button>
              </div>

              <div className="qr-instructions">
                <h4>Instructions:</h4>
                <ol>
                  <li>Display this QR code to your students.</li>
                  <li>Students should scan the QR code using the "Scan QR" tab.</li>
                  <li>QR code expires in 2 minutes for security.</li>
                  <li>Generate a new code if needed.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="qr-scanner">
              {scanResult ? (
                <div className={`scan-result ${scanResult.success ? "success" : "error"}`}>
                  <div className="result-icon">{scanResult.success ? "✓" : "✗"}</div>
                  <div className="result-message">{scanResult.message}</div>
                  <div className="result-timestamp">{scanResult.timestamp}</div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setScanResult(null)
                      startCamera()
                    }}
                  >
                    Scan Again
                  </button>
                </div>
              ) : scanError ? (
                <div className="scan-error">
                  <div className="error-icon">!</div>
                  <div className="error-message">{scanError}</div>
                  <button className="btn btn-primary" onClick={startCamera}>
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="camera-container">
                    <video ref={videoRef} autoPlay playsInline muted></video>
                    <div className="scan-overlay">
                      <div className="scan-target"></div>
                    </div>
                  </div>

                  <div className="scanner-actions">
                    <button className="btn btn-primary" onClick={handleScan}>
                      Mark Attendance
                    </button>
                  </div>

                  <div className="scanner-instructions">
                    <p>Point your camera at the QR code displayed by your instructor.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRAttendance
    