const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "")
  if (!token) return res.status(401).json({ message: "No token, authorization denied" })

  try {
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error: JWT secret not set" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

module.exports = auth
