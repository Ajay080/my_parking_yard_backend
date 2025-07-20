import mongoose from 'mongoose';
const CCTVSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    zoneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone',
    },
    streamUrl:{
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
})

export const Device= mongoose.model('Device', CCTVSchema, 'device'); // Create Device model