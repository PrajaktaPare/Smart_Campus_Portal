const Placement = require("../models/Placement")

// Get all placements
exports.getAllPlacements = async (req, res) => {
  try {
    console.log("💼 Getting all placements")

    const placements = await Placement.find().populate("createdBy", "name email").sort({ createdAt: -1 })

    res.json(placements)
  } catch (error) {
    console.error("Error fetching placements:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create placement
exports.createPlacement = async (req, res) => {
  try {
    const { company, position, description, requirements, salary, deadline } = req.body

    const placement = new Placement({
      company,
      position,
      description,
      requirements,
      salary,
      deadline,
      createdBy: req.user.userId,
    })

    await placement.save()

    const populatedPlacement = await Placement.findById(placement._id).populate("createdBy", "name email")

    res.status(201).json(populatedPlacement)
  } catch (error) {
    console.error("Error creating placement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get placement by ID
exports.getPlacementById = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.placementId)
      .populate("createdBy", "name email")
      .populate("applicants", "name email")

    if (!placement) {
      return res.status(404).json({ message: "Placement not found" })
    }

    res.json(placement)
  } catch (error) {
    console.error("Error fetching placement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update placement
exports.updatePlacement = async (req, res) => {
  try {
    const { placementId } = req.params
    const updates = req.body

    const placement = await Placement.findByIdAndUpdate(placementId, updates, { new: true }).populate(
      "createdBy",
      "name email",
    )

    if (!placement) {
      return res.status(404).json({ message: "Placement not found" })
    }

    res.json(placement)
  } catch (error) {
    console.error("Error updating placement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete placement
exports.deletePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByIdAndDelete(req.params.placementId)

    if (!placement) {
      return res.status(404).json({ message: "Placement not found" })
    }

    res.json({ message: "Placement deleted successfully" })
  } catch (error) {
    console.error("Error deleting placement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Apply for placement
exports.applyForPlacement = async (req, res) => {
  try {
    const { placementId } = req.params

    const placement = await Placement.findById(placementId)
    if (!placement) {
      return res.status(404).json({ message: "Placement not found" })
    }

    // Check if already applied
    if (placement.applicants.includes(req.user.userId)) {
      return res.status(400).json({ message: "Already applied for this placement" })
    }

    placement.applicants.push(req.user.userId)
    await placement.save()

    res.json({ message: "Applied successfully" })
  } catch (error) {
    console.error("Error applying for placement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
