"use client"

import { useState, useEffect } from "react"
import "./AccessibilityPanel.css"

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    fontSize: "medium",
    contrast: "normal",
    reducedMotion: false,
    dyslexicFont: false,
    lineHeight: "normal",
    letterSpacing: "normal",
    highlightLinks: false,
    cursorSize: "normal",
  })

  useEffect(() => {
    // Apply settings to document
    document.documentElement.setAttribute("data-font-size", settings.fontSize)
    document.documentElement.setAttribute("data-contrast", settings.contrast)
    document.documentElement.setAttribute("data-reduced-motion", settings.reducedMotion)
    document.documentElement.setAttribute("data-dyslexic-font", settings.dyslexicFont)
    document.documentElement.setAttribute("data-line-height", settings.lineHeight)
    document.documentElement.setAttribute("data-letter-spacing", settings.letterSpacing)
    document.documentElement.setAttribute("data-highlight-links", settings.highlightLinks)
    document.documentElement.setAttribute("data-cursor-size", settings.cursorSize)

    // Save settings to localStorage
    localStorage.setItem("accessibility-settings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem("accessibility-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value,
    })
  }

  const resetSettings = () => {
    setSettings({
      fontSize: "medium",
      contrast: "normal",
      reducedMotion: false,
      dyslexicFont: false,
      lineHeight: "normal",
      letterSpacing: "normal",
      highlightLinks: false,
      cursorSize: "normal",
    })
  }

  return (
    <div className="accessibility-panel">
      <button className="accessibility-toggle" onClick={togglePanel} aria-label="Toggle Accessibility Panel">
        <span className="accessibility-icon">♿</span>
      </button>

      {isOpen && (
        <div className="accessibility-menu">
          <div className="accessibility-header">
            <h3>Accessibility Settings</h3>
            <button className="close-btn" onClick={togglePanel} aria-label="Close Accessibility Panel">
              ×
            </button>
          </div>

          <div className="accessibility-content">
            <div className="setting-group">
              <label>Font Size</label>
              <div className="setting-controls">
                <button
                  className={`setting-btn ${settings.fontSize === "small" ? "active" : ""}`}
                  onClick={() => handleSettingChange("fontSize", "small")}
                >
                  A-
                </button>
                <button
                  className={`setting-btn ${settings.fontSize === "medium" ? "active" : ""}`}
                  onClick={() => handleSettingChange("fontSize", "medium")}
                >
                  A
                </button>
                <button
                  className={`setting-btn ${settings.fontSize === "large" ? "active" : ""}`}
                  onClick={() => handleSettingChange("fontSize", "large")}
                >
                  A+
                </button>
                <button
                  className={`setting-btn ${settings.fontSize === "x-large" ? "active" : ""}`}
                  onClick={() => handleSettingChange("fontSize", "x-large")}
                >
                  A++
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label>Contrast</label>
              <div className="setting-controls">
                <button
                  className={`setting-btn ${settings.contrast === "normal" ? "active" : ""}`}
                  onClick={() => handleSettingChange("contrast", "normal")}
                >
                  Normal
                </button>
                <button
                  className={`setting-btn ${settings.contrast === "high" ? "active" : ""}`}
                  onClick={() => handleSettingChange("contrast", "high")}
                >
                  High
                </button>
                <button
                  className={`setting-btn ${settings.contrast === "inverted" ? "active" : ""}`}
                  onClick={() => handleSettingChange("contrast", "inverted")}
                >
                  Inverted
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label>Reading Aids</label>
              <div className="setting-controls">
                <div className="setting-toggle">
                  <input
                    type="checkbox"
                    id="dyslexic-font"
                    checked={settings.dyslexicFont}
                    onChange={(e) => handleSettingChange("dyslexicFont", e.target.checked)}
                  />
                  <label htmlFor="dyslexic-font">Dyslexia Friendly Font</label>
                </div>

                <div className="setting-toggle">
                  <input
                    type="checkbox"
                    id="highlight-links"
                    checked={settings.highlightLinks}
                    onChange={(e) => handleSettingChange("highlightLinks", e.target.checked)}
                  />
                  <label htmlFor="highlight-links">Highlight Links</label>
                </div>
              </div>
            </div>

            <div className="setting-group">
              <label>Text Spacing</label>
              <div className="setting-controls">
                <select value={settings.lineHeight} onChange={(e) => handleSettingChange("lineHeight", e.target.value)}>
                  <option value="normal">Normal Line Height</option>
                  <option value="increased">Increased Line Height</option>
                  <option value="double">Double Line Height</option>
                </select>

                <select
                  value={settings.letterSpacing}
                  onChange={(e) => handleSettingChange("letterSpacing", e.target.value)}
                >
                  <option value="normal">Normal Letter Spacing</option>
                  <option value="increased">Increased Letter Spacing</option>
                  <option value="wide">Wide Letter Spacing</option>
                </select>
              </div>
            </div>

            <div className="setting-group">
              <label>Motion & Animation</label>
              <div className="setting-controls">
                <div className="setting-toggle">
                  <input
                    type="checkbox"
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onChange={(e) => handleSettingChange("reducedMotion", e.target.checked)}
                  />
                  <label htmlFor="reduced-motion">Reduce Motion</label>
                </div>
              </div>
            </div>

            <div className="setting-group">
              <label>Cursor</label>
              <div className="setting-controls">
                <select value={settings.cursorSize} onChange={(e) => handleSettingChange("cursorSize", e.target.value)}>
                  <option value="normal">Normal Cursor</option>
                  <option value="large">Large Cursor</option>
                  <option value="x-large">Extra Large Cursor</option>
                </select>
              </div>
            </div>

            <button className="btn btn-outline-danger reset-btn" onClick={resetSettings}>
              Reset All Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessibilityPanel
    