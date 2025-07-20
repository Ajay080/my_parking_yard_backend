import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('strictQuery', false); // Add this line

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    }
    catch(e){
        console.error("Error connecting to the MongoDB", e);
        process.exit(1);
    }
}

export default connectDB;