
import { Vehicle } from '../models/Vehicle.js';
import { User } from '../models/User.js'; // Assuming you have a User model to check user existence
const getVehicles = async (req, res)=>{
    try{
        const {pageSize, pageNumber, Search} = req.query;
        let vehicleData= [];
        let totalVehicles=0;
        if(!pageSize || !pageNumber) {
            vehicleData= await Vehicle.find({name: {$regex: Search || "", $options: "i"}});
        }
        else vehicleData= await Vehicle.find({name: {$regex: Search || "", $options: "i"}}).skip(pageNumber*pageSize).limit(pageSize);
        totalVehicles= await Vehicle.countDocuments({name: {$regex: Search || "", $options: "i"}});
        return res.status(200).json({"message": "Vehicles fetched successfully", "data": vehicleData, "total": totalVehicles});
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error", "error": err.message});
    }
}

const getVehicle = async (req, res)=>{
    try{
        const vehicleId= req.params.id;
        if(!vehicleId) return res.status(400).json({"message": "error", "error": "Vehicle ID is required"});
        const vehicle = await Vehicle.findById(vehicleId);
        if(!vehicle) return res.status(404).json({"message":"error", "error":"Vehicle not found"});
        return res.status(200).json({"message":"Vehicle fetched successfully", data: vehicle});
    }
    catch(err){
        return res.status(500).json({"message":"Internal Server Error", "error":err.message});
    }
}

const createVehicle = async (req, res)=>{
    try{
        const {userId, numberPlate}= req.body;
        if(!userId || !numberPlate) return res.status(400).json({"message":"error", "error":"User ID and Number Plate are required"});
        const existingVehicle = await Vehicle.findOne({numberPlate});
        if(existingVehicle) return res.status(400).json({"message":"error", "error":"Vehicle with this number plate already exists"});
        const userExists = await User.findById(userId);
        if(!userExists) return res.status(404).json({"message":"error", "error":"User not found"});
        const newVehicle = new Vehicle({userId, numberPlate});
        await newVehicle.save();
        return res.status(201).json({"message":"Vehicle created successfully", data: newVehicle});
    }
    catch(error){
        return res.status(500).json({"message":"Internal Server Error", "error":error.message});
    }
}

const updateVehicle = async (req, res)=>{
    try{
        const vehicleId = req.params.id;
        if(!vehicleId) return res.status(400).json({"message":"error", "error":"Vehicle ID is required"});
        const {userId, numberPlate} = req.body; 
        if(!userId || !numberPlate) return res.status(400).json({"message":"error", "error":"User ID and Number Plate are required"});
        const userExists = await User.findById(userId);
        if(!userExists) return res.status(404).json({"message":"error", "error":"User not found"});
        const updatedVehicle  = await Vehicle.findByIdAndUpdate(vehicleId, {userId, numberPlate}, {new: true});
        if(!updatedVehicle) return res.status(404).json({"message":"error", "error":"Vehicle not found"});
        return res.status(200).json({"message":"Vehicle updated successfully", data: updatedVehicle});  
    }
    catch(error){
        return res.status(500).json({"message":"Internal Server Error", "error":error.message});    
    }
}

const deletedVehicle = async (req, res)=>{
    try{
        const vehicleId = req.params.id;
        if(!vehicleId) return res.status(400).json({"message":"error", "error":"Vehicle ID is required"});
        const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);
        if(!deletedVehicle) return res.status(404).json({"message":"error", "error":"Vehicle not found"});
        return res.status(200).json({"message":"Vehicle deleted successfully", data: deletedVehicle});
    }
    catch(error){
        return res.status(500).json({"message":"Internal Server Error", "error":error.message});
    }
}

export {getVehicles, getVehicle, createVehicle, updateVehicle, deletedVehicle}; // Export the functions to be used in routes