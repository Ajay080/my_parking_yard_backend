import {Device} from '../models/Device.js';
import { Zone } from '../models/Zone.js';
import fs from 'fs';
import path from 'path';

const getDevices = async (req, res) => {
  try {
    let { pageSize, pageNumber, Search, zoneId } = req.query;

    pageSize = parseInt(pageSize) || 0;
    pageNumber = parseInt(pageNumber) || 0;

    // Build query
    const query = {
      name: { $regex: Search || "", $options: "i" },
    };

    // Add zone filter if provided
    if (zoneId) {
      query.zoneId = zoneId;
    } else {
      query.zoneId = { $type: 'objectId' }; // ensure valid ObjectId only
    }
    
    let deviceData = [];
    let totalDevices = await Device.countDocuments(query);

    if (pageSize > 0 && pageNumber >= 0) {
      deviceData = await Device.find(query)
        .populate('zoneId', 'name')
        .skip(pageNumber * pageSize)
        .limit(pageSize);
    } else {
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

const updateDeviceStreamUrls = async (req, res) => {
    try {
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? process.env.PRODUCTION_URL || `${req.protocol}://${req.get('host')}`
            : `${req.protocol}://${req.get('host')}`;
        
        // Check if local videos exist (only 2 videos)
        const videoDir = path.join(__dirname, '../public/videos');
        const localVideoFiles = [];
        
        if (fs.existsSync(videoDir)) {
            const files = ['parking1.mp4', 'parking2.mp4']; // Only 2 videos
            files.forEach(file => {
                if (fs.existsSync(path.join(videoDir, file))) {
                    localVideoFiles.push(`${baseUrl}/videos/${file}`);
                }
            });
        }
        
        // Use local videos if available, otherwise fallback to external
        const parkingDemoUrls = localVideoFiles.length > 0 ? [
            ...localVideoFiles,
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Fallback
            'https://www.w3schools.com/html/mov_bbb.mp4' // Fallback
        ] : [
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'https://www.w3schools.com/html/mov_bbb.mp4'
        ];

        const devices = await Device.find({});
        
        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            const demoUrl = parkingDemoUrls[i % parkingDemoUrls.length];
            
            await Device.findByIdAndUpdate(device._id, {
                streamUrl: demoUrl
            });
        }

        return res.status(200).json({
            message: "All device stream URLs updated with car parking surveillance videos",
            updatedCount: devices.length,
            videoType: "Car Parking Surveillance",
            baseUrl: baseUrl,
            environment: process.env.NODE_ENV || 'development',
            localVideosFound: localVideoFiles.length,
            localVideos: localVideoFiles,
            note: "System configured for 2 local parking videos"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export {getDevices, getDevice, createDevice, updateDevice, deletedDevice, updateDeviceStreamUrls};