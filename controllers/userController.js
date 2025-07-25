import {User} from '../models/User.js'; // Importing the User model
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Helper function to check database connection
const checkDBConnection = () => {
    if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection not ready');
    }
};

const getUsers = async (req, res)=>{
    try {
        checkDBConnection();
        
        let pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : NaN;
        let pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : NaN;
        let search = req.query.search ? req.query.search : "";
        let userData = [];
        let totalUsers = 0;
        
        const searchQuery = {
            $or: [
                {name: {$regex: search, $options: "i"}},
                {phone: {$regex: search, $options: "i"}},
                {email: {$regex: search, $options: "i"}},
                {role: {$regex: search, $options: "i"}}
            ]
        };
        
        if (isNaN(pageNumber) || isNaN(pageSize)) {
            userData = await User.find(searchQuery).maxTimeMS(20000);
        } else {
            userData = await User.find(searchQuery)
                .skip(pageNumber * pageSize)
                .limit(pageSize)
                .maxTimeMS(20000);
        }
        
        totalUsers = await User.countDocuments(searchQuery).maxTimeMS(20000);
        
        return res.status(200).json({
            "message": "Users fetched successfully", 
            "data": userData, 
            "total": totalUsers
        });
    } catch (error) {
        console.error('Error in getUsers:', error);
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({message: "Database connection timeout. Please try again.", error: error.message});
        }
        return res.status(500).json({message: "Internal Server Error", error: error.message});
    }
}

const getUser= async (req, res)=>{
    try{
        checkDBConnection();
        
        let userId= req.params.id;
        if(!userId) return res.status(400).json({"message":"error", "error":"User ID is required"});
        let user= await User.findById(userId).maxTimeMS(20000);
        if(!user) return res.status(404).json({"message":"error", "error":"User not found"});
        return res.status(200).json({"message":"User fetched successfully", "data":user});
    }
    catch (error){
        console.error('Error in getUser:', error);
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({message: "Database connection timeout. Please try again.", error: error.message});
        }
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

const createUser= async (req, res)=>{
    try{
        checkDBConnection();
        
        let {name, email, phone, password, role}=req.body;
        if(!name || !email || !phone || !password) return res.status(400).json({"message":"error", "error":"All fields are required"});
        let existingUser= await User.findOne({email:email}).maxTimeMS(20000);
        if(existingUser) return res.status(400).json({"message":"error", "error":"User with this email already exists"});
        let newUser = new User({name, email, phone, password, role});
        await newUser.save();
        return res.status(201).json({"message":"User created successfully", "data":newUser});
    }
    catch(error){
        console.error('Error in createUser:', error);
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({message: "Database connection timeout. Please try again.", error: error.message});
        }
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

const updateUser= async(req, res)=>{
    try{
        checkDBConnection();
        
        let userId= req.params.id;
        if(!userId) return res.status(400).json({"message":"error", "error":"User ID is required"});
        let {name, email, phone, password, role}=req.body;
        if(!name || !email || !phone || !password) return res.status(400).json({"message":"error", "error":"All fields are required"});
        let existingUser= await User.findOne({email:email, _id:{$ne:userId}}).maxTimeMS(20000);
        if(existingUser) return res.status(400).json({"message":"error", "error":"User with this email already exists"});
        let updatedUser = await User.findByIdAndUpdate(userId, {name, email, phone, password, role}, {new:true}).maxTimeMS(20000);
        if(!updatedUser) return res.status(404).json({"message":"error", "error":"User not found"});
        return res.status(200).json({"message":"User updated successfully", "data":updatedUser});
    }
    catch (error){
        console.error('Error in updateUser:', error);
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({message: "Database connection timeout. Please try again.", error: error.message});
        }
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

const deleteUser= async(req, res)=>{
    try{
        checkDBConnection();
        
        let userId= req.params.id;
        if(!userId) return res.status(400).json({"message":"error", "error":"User ID is required"});
        let deletedUser = await User.findByIdAndDelete(userId).maxTimeMS(20000);
        if(!deletedUser) return res.status(404).json({"message":"error", "error":"User not found"});
        return res.status(200).json({"message":"User deleted successfully", "data":deletedUser});
    }
    catch (error){
        console.error('Error in deleteUser:', error);
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({message: "Database connection timeout. Please try again.", error: error.message});
        }
        return res.status(500).json({message:"Internal Server Error", error:error.message})
    }
}

const loginUser = async (req, res) => {
    try {
        checkDBConnection();
        
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).maxTimeMS(20000);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        };

        return res.status(200).json({
            message: "Login successful",
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({message: "Database connection timeout. Please try again.", error: error.message});
        }
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        checkDBConnection();
        
        const { name, email, phone, password, role } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email }).maxTimeMS(20000);
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const newUser = new User({ name, email, phone, password, role: role || 'user' });
        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const userResponse = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role
        };

        return res.status(201).json({
            message: "User registered successfully",
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({message: "Database connection timeout. Please try again.", error: error.message});
        }
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export { getUsers, getUser, createUser, updateUser, deleteUser, loginUser, registerUser }; // Exporting the functions for use in routes