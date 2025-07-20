import {Zone} from '../models/Zone.js';

const getZones = async (req, res) => {
    try {
        const { pageSize, pageNumber, Search } = req.query;
        let zoneData = [];
        let totalZones = 0;

        if (!pageSize || !pageNumber) {
            zoneData = await Zone.find({ name: { $regex: Search || "", $options: "i" } });
        } else {
            zoneData = await Zone.find({ name: { $regex: Search || "", $options: "i" } })
                .skip(pageNumber * pageSize)
                .limit(pageSize);
        }
        
        totalZones = await Zone.countDocuments({ name: { $regex: Search || "", $options: "i" } });
        return res.status(200).json({ "message": "Zones fetched successfully", "data": zoneData, "total": totalZones });
    } catch (err) {
        return res.status(500).json({ "message": "Internal Server Error", "error": err.message });
    }
} 

const getZone = async (req, res) => {
    try {
        const zoneId = req.params.id;
        if (!zoneId) return res.status(400).json({ "message": "error", "error": "Zone ID is required" });
        
        const zone = await Zone.findById(zoneId);
        if (!zone) return res.status(404).json({ "message": "error", "error": "Zone not found" });
        
        return res.status(200).json({ "message": "Zone fetched successfully", data: zone });
    } catch (err) {
        return res.status(500).json({ "message": "Internal Server Error", "error": err.message });
    }
}

const createZone = async (req, res) => {
    try {
        const { name, description, vertices } = req.body;
        if (!name || !description || !vertices) return res.status(400).json({ "message": "error", "error": "Name, Description and Shape are required" });
        
        const existingZone = await Zone.findOne({ name });
        if (existingZone) return res.status(400).json({ "message": "error", "error": "Zone with this name already exists" });
        
        const newZone = new Zone({ name, description, vertices });
        await newZone.save();
        
        return res.status(201).json({ "message": "Zone created successfully", data: newZone });
    } catch (error) {
        return res.status(500).json({ "message": "Internal Server Error", "error": error.message });
    }
}

const updateZone = async (req, res) => {
    try {
        const zoneId = req.params.id;
        if (!zoneId) return res.status(400).json({ "message": "error", "error": "Zone ID is required" });
        
        const { name, description, vertices } = req.body;
        if (!name || !description || !vertices) return res.status(400).json({ "message": "error", "error": "Name, Description and Shape are required" });
        
        const updatedZone = await Zone.findByIdAndUpdate(zoneId, { name, description, vertices }, { new: true });
        if (!updatedZone) return res.status(404).json({ "message": "error", "error": "Zone not found" });
        
        return res.status(200).json({ "message": "Zone updated successfully", data: updatedZone });
    } catch (error) {
        return res.status(500).json({ "message": "Internal Server Error", "error": error.message });
    }
}   

const deleteZone = async (req, res) => {
    try {
        const zoneId = req.params.id;
        if (!zoneId) return res.status(400).json({ "message": "error", "error": "Zone ID is required" });
        
        const deletedZone = await Zone.findByIdAndDelete(zoneId);
        if (!deletedZone) return res.status(404).json({ "message": "error", "error": "Zone not found" });
        
        return res.status(200).json({ "message": "Zone deleted successfully", data: deletedZone });
    } catch (error) {
        return res.status(500).json({ "message": "Internal Server Error", "error": error.message });
    }
}

export { getZones, getZone, createZone, updateZone, deleteZone };