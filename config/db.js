import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); //Loads environent file variables

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, // use new url string parser,
            useUnifiedTopology: true, // use new server discovery and monitoring engine
        })
    }
    catch(e){
        console.error("Error connecting to the MongoDB", e);
        process.exit(1); // Exit the process with failure
    }
}

export default connectDB;