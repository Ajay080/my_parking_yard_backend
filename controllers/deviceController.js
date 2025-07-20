import {Device} from '../models/Device.js';
import { Zone } from '../models/Zone.js';
const getDevices = async (req, res) => {
  try {
    let { pageSize, pageNumber, Search } = req.query;

    // Convert to numbers to avoid type issues
    pageSize = parseInt(pageSize) || 0;
    pageNumber = parseInt(pageNumber) || 0;

    // Build query
    const query = {
    name: { $regex: Search || "", $options: "i" },
    zoneId: { $type: 'objectId' }, // ensure valid ObjectId only
    };
    
    let deviceData = [];
    let totalDevices = await Device.countDocuments(query);

    // If pagination is provided
    if (pageSize > 0 && pageNumber >= 0) {
      deviceData = await Device.find(query)
        .populate('zoneId', 'name') // 👈 Only include zone name
        .skip(pageNumber * pageSize)
        .limit(pageSize);
    } else {
      // If no pagination
      deviceData = await Device.find(query).populate('zoneId', 'name');
    }

    return res.status(200).json({
      message: "Device fetched successfully",
      data: deviceData,
      total: totalDevices,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const getDevice= async (req, res)=>{
    try{
        const DevicedId= req.params.id;
        if(!DevicedId) return res.status(400).json({"message": "error", "error": "Device ID is required"});
        const device = await Device.findById(DevicedId).populate('zoneId', 'name');
        if(!device) return res.status(404).json({"message":"error", "error":"Device not found"});
        return res.status(200).json({"message":"Device fetched successfully", data: device});       
    }
    catch(error){
        return res.status(500).json({"message":"Internal Server Error", "error": error.message})
    }
}

const createDevice = async (req, res)=>{
    try{
        const {name, zoneId, streamUrl} = req.body;
        if(!name || !streamUrl) return res.status(400).json({"message":"error", "error":"Name and Stream URL are required"});
        const existingDevice = await Device.findOne({name});
        if(existingDevice) return res.status(400).json({"message":"error", "error":"Device with this name already exists"});
        const newDevice = new Device({name, zoneId, streamUrl});
        await newDevice.save();
        return res.status(201).json({"message":"Device created successfully", data: newDevice});
    }
    catch(error){
        return res.status(500).json({"message":"Internal Server Error", "error": error.message});
    }
}

const updateDevice = async (req, res)=>{
    try{
        const deviceId = req.params.id;
        if(!deviceId) return res.status(400).json({"message":"error", "error":"Device ID is required"});
        const {name, zoneId, streamUrl} = req.body; 
        if(!name || !streamUrl) return res.status(400).json({"message":"error", "error":"Name and Stream URL are required"});
        const zoneExists = await Zone.findById(zoneId);
        if(!zoneExists) return res.status(404).json({"message":"error", "error":"Zone not found"});
        const updatedDevice  = await Device.findByIdAndUpdate(deviceId, {name, zoneId, streamUrl}, {new: true});
        if(!updatedDevice) return res.status(404).json({"message":"error", "error":"Device not found"});
        return res.status(200).json({"message":"Device updated successfully", data: updatedDevice});  
    }
    catch(error){
        return res.status(500).json({"message":"Internal Server Error", "error": error.message});
    }
}

const deletedDevice = async (req, res)=>{
    try{
        const deviceId = req.params.id;
        if(!deviceId) return res.status(400).json({"message":"error", "error":"Device ID is required"});
        const deletedDevice = await Device.findByIdAndDelete(deviceId);
        if(!deletedDevice) return res.status(404).json({"message":"error", "error":"Device not found"});
        return res.status(200).json({"message":"Device deleted successfully", data: deletedDevice});
    }
    catch(error){
        return res.status(500).json({"message":"Internal Server Error", "error": error.message});
    }
}

export {getDevices, getDevice, createDevice, updateDevice, deletedDevice};