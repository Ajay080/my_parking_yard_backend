import mongoose from 'mongoose';

const vehicleSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    numberPlate:{
        type:String,
        required:true
    }
},
{
    timestamp: true, // Automatically manage createdAt and updatedAt fields
});


export const Vehicle = mongoose.model('Vehicle', vehicleSchema, 'vehicle'); // Create Vehicle model