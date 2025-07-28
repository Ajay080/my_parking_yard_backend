import mongoose from 'mongoose';
import {Spot} from './Spot.js';

const bookingSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    numberPlate:{
        type:String,
        required:true
    },
    spotId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Spot',
        required:true
    },
    zoneId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone',
        required: true
    },
    startTime:{
        type: Date,
        required:true,
        validate:{
            validator: function(value) {
                // Ensure start time is in the future
                return value > new Date();
            },
            message: props => `Start time ${props.value} must be in the future!`
        }
    },
    endTime:{
        type: Date,
        required:true,
        validate:{
            validator: function(value) {
                // Ensure end time is after start time
                return value > this.startTime;
            },
            message: props => `End time ${props.value} must be after start time!`
        }
    },
    bookingStatus:{
        type: String,
        enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
        default: "Pending"
    },
    amount:{
        type: Number,
        required:true,
        validate:{
            validator: function(value) {
                // Ensure amount is a positive number
                return value > 0;
            },
            message: props => `Amount ${props.value} must be a positive number!`
        }
    }
},{timestamps:true}); // Automatically manage createdAt and updatedAt fields

export const Booking=mongoose.model('Booking', bookingSchema, 'booking'); // Create Booking model