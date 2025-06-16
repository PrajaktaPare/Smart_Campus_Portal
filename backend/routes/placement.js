const express = require("express")
const router = express.Router()
const { auth, requireRole } = require("../middleware/auth")
const placementController = require("../controllers/placementController")

console.log("💼 Placement routes loaded")

// Apply auth middleware to all routes
router.use(auth)

// Get all placements
router.get("/", placementController.getAllPlacements)

// Create placement (Admin only)
router.post("/", requireRole(["admin"]), placementController.createPlacement)

// Get placement by ID
router.get("/:placementId", placementController.getPlacementById)

// Update placement (Admin only)
router.put("/:placementId", requireRole(["admin"]), placementController.updatePlacement)

// Delete placement (Admin only)
router.delete("/:placementId", requireRole(["admin"]), placementController.deletePlacement)

// Apply for placement (Student only)
router.post("/:placementId/apply", requireRole(["student"]), placementController.applyForPlacement)

module.exports = router
