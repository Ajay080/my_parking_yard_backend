import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('strictQuery', false); // Add this line

const connectDB = async () => {
    try {
        const options = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 30000, // 30 seconds
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 30000,
            heartbeatFrequencyMS: 10000,
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
        return conn;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export default connectDB;