import {User} from '../models/User.js'; // Importing the User model

const getUsers = async (req, res)=>{
    try{
        let pageSize =  req.query.pageSize?parseInt(req.query.pageSize):NaN;
        let pageNumber = req.query.pageNumber?parseInt(req.query.pageNumber):NaN;
        let search =req.query.search?req.query.search:"";
        let userData=[];
        let totalUsers=0;
        if(isNaN(pageNumber) || isNaN(pageSize)) userData= await User.find({name:{$regex:search, $options:"i"}, phone: {$regex:search, $options:"i"}, email:{$regex:search, $options:"i"}, role:{$regex:search, $options:"i"}});
        else userData= await User.find({name:{$regex:search, $options:"i"}, phone: {$regex:search, $options:"i"}, email:{$regex:search, $options:"i"}, role:{$regex:search, $options:"i"}}).skip(pageNumber*pageSize).limit(pageSize);
        totalUsers= await User.countDocuments({name:{$regex:search, $options:"i"}, phone: {$regex:search, $options:"i"}, email:{$regex:search, $options:"i"}, role:{$regex:search, $options:"i"}});
        return res.status(200).json({"message":"Users fetched successfully", "data":userData, "total":totalUsers});
    }
    catch (error){
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

const getUser= async (req, res)=>{
    try{
        let userId= req.params.id;
        if(!userId) return res.status(400).json({"message":"error", "error":"User ID is required"});
        let user= await User.findById(userId);
        if(!user) return res.status(404).json({"message":"error", "error":"User not found"});
        return res.status(200).json({"message":"User fetched successfully", "data":user});
    }
    catch (error){
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

const createUser= async (req, res)=>{
    try{
        let {name, email, phone, password, role}=req.body;
        if(!name || !email || !phone || !password) return res.status(400).json({"message":"error", "error":"All fields are required"});
        let existingUser= await User.findOne({email:email});
        if(existingUser) return res.status(400).json({"message":"error", "error":"User with this email already exists"});
        let newUser = new User({name, email, phone, password, role});
        await newUser.save();
        return res.status(201).json({"message":"User created successfully", "data":newUser});
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

const updateUser= async(req, res)=>{
    try{
        let userId= req.params.id;
        if(!userId) return res.status(400).json({"message":"error", "error":"User ID is required"});
        let {name, email, phone, password, role}=req.body;
        if(!name || !email || !phone || !password) return res.status(400).json({"message":"error", "error":"All fields are required"});
        let existingUser= await User.findOne({email:email, _id:{$ne:userId}});
        if(existingUser) return res.status(400).json({"message":"error", "error":"User with this email already exists"});
        let updatedUser = await User.findByIdAndUpdate(userId, {name, email, phone, password, role}, {new:true});
        if(!updatedUser) return res.status(404).json({"message":"error", "error":"User not found"});
        return res.status(200).json({"message":"User updated successfully", "data":updatedUser});
    }
    catch (error){
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

const deleteUser= async(req, res)=>{
    try{
        let userId= req.params.id;
        if(!userId) return res.status(400).json({"message":"error", "error":"User ID is required"});
        let deletedUser = await User.findByIdAndDelete(userId);
        if(!deletedUser) return res.status(404).json({"message":"error", "error":"User not found"});
        return res.status(200).json({"message":"User deleted successfully", "data":deletedUser});
    }
    catch (error){
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

export { getUsers, getUser, createUser, updateUser, deleteUser }; // Exporting the functions for use in routes