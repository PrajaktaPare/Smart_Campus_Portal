// Simple toast utility without external dependencies
export const showToast = (message, type = "info") => {
  console.log(`${type.toUpperCase()}: ${message}`)

  // Create a simple toast notification
  const toast = document.createElement("div")
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: opacity 0.3s ease;
    ${type === "success" ? "background-color: #28a745;" : ""}
    ${type === "error" ? "background-color: #dc3545;" : ""}
    ${type === "info" ? "background-color: #17a2b8;" : ""}
    ${type === "warning" ? "background-color: #ffc107; color: black;" : ""}
  `
  toast.textContent = message

  document.body.appendChild(toast)

  // Remove toast after 3 seconds with fade out
  setTimeout(() => {
    toast.style.opacity = "0"
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

// For backward compatibility
export default {
  success: (message) => showToast(message, "success"),
  error: (message) => showToast(message, "error"),
  warning: (message) => showToast(message, "warning"),
  info: (message) => showToast(message, "info"),
}
