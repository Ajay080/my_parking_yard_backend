import {Spot} from '../models/Spot.js';
import {Zone} from '../models/Zone.js'

const getSpots = async (req, res) => {
    try {
        const { pageSize, pageNumber, Search } = req.query;
        const zoneId = req.query.zoneId;
        let spotData = [];
        let totalSpots = 0;

        if (!pageSize || !pageNumber) {
            spotData = await Spot.find({ name: { $regex: Search || "", $options: "i" }, zoneId:zoneId});
        } else {
            spotData = await Spot.find({ name: { $regex: Search || "", $options: "i" }, zoneId:zoneId})
                .skip(pageNumber * pageSize)
                .limit(pageSize);
        }
        
        totalSpots = await Spot.countDocuments({ name: { $regex: Search || "", $options: "i" } });
        return res.status(200).json({ "message": "Spots fetched successfully", "data": spotData, "total": totalSpots });
    } catch (err) {
        return res.status(500).json({ "message": "Internal Server Error", "error": err.message });
    }
}
const getSpotStats = async (req, res) => {
  try {
    const { zoneId } = req.query;
    let filter = {};
    if (zoneId) {
      const zoneIdArr = Array.isArray(zoneId)
        ? zoneId
        : zoneId.split(",");
      filter.zoneId = { $in: zoneIdArr };
    }

    const spots = await Spot.find(filter);

    const totalSpots = spots.length;
    const availableSpots = spots.filter(s => s.status === "Available").length;
    const reservedSpots = spots.filter(s => s.status === "Reserved").length;
    const occupiedSpots = spots.filter(s => s.status === "Occupied").length;

    return res.status(200).json({
      totalSpots,
      availableSpots,
      reservedSpots,
      occupiedSpots,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
const getSpot = async (req, res) => {
    try {
        const spotId = req.params.id;
        if (!spotId) return res.status(400).json({ "message": "error", "error": "Spot ID is required" });
        
        const spot = await Spot.findById(spotId);
        if (!spot) return res.status(404).json({ "message": "error", "error": "Spot not found" });
        
        return res.status(200).json({ "message": "Spot fetched successfully", data: spot });
    } catch (err) {
        return res.status(500).json({ "message": "Internal Server Error", "error": err.message });
    }
}

const createSpot = async (req, res) => {
    try {
        const { name, zoneId, vertices } = req.body;
        if (!name || !zoneId || !vertices) return res.status(400).json({ "message": "error", "error": "Name, Shape and Zone ID are required" });
        
        const existingSpot = await Spot.findOne({ name });
        if (existingSpot) return res.status(400).json({ "message": "error", "error": "Spot with this name already exists" });
        
        const existingZone = await Zone.findById(zoneId);
        if (!existingZone) return res.status(404).json({ "message": "error", "error": "Zone not found" });
        const newSpot = new Spot({ name, zoneId, vertices });
        await newSpot.save();
        
        return res.status(201).json({ "message": "Spot created successfully", data: newSpot });
    } catch (error) {
        return res.status(500).json({ "message": "Internal Server Error", "error": error.message });
    }
}

const updateSpot = async (req, res) => {
    try {
        const spotId = req.params.id;
        if (!spotId) return res.status(400).json({ "message": "error", "error": "Spot ID is required" });
        
        const { name, zoneId, vertices } = req.body;
        if (!name || !zoneId || !vertices) return res.status(400).json({ "message": "error", "error": "Name, Shape and Zone ID are required" });
        
        const existingZone = await Zone.findById(zoneId);
        if (!existingZone) return res.status(404).json({ "message": "error", "error": "Zone not found" });
        
        const updatedSpot = await Spot.findByIdAndUpdate(spotId, { name, zoneId, vertices }, { new: true });
        if (!updatedSpot) return res.status(404).json({ "message": "error", "error": "Spot not found" });
        
        return res.status(200).json({ "message": "Spot updated successfully", data: updatedSpot });
    } catch (error) {
        return res.status(500).json({ "message": "Internal Server Error", "error": error.message });
    }
}

const deleteSpot = async (req, res) => {
    try {
        const spotId = req.params.id;
        if (!spotId) return res.status(400).json({ "message": "error", "error": "Spot ID is required" });
        
        const deletedSpot = await Spot.findByIdAndDelete(spotId);
        if (!deletedSpot) return res.status(404).json({ "message": "error", "error": "Spot not found" });
        
        return res.status(200).json({ "message": "Spot deleted successfully", data: deletedSpot });
    } catch (error) {
        return res.status(500).json({ "message": "Internal Server Error", "error": error.message });
    }
}

export { getSpots, getSpot, createSpot, updateSpot, deleteSpot, getSpotStats};