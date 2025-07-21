import mongoose from 'mongoose';
const spotSchema= new mongoose.Schema({
    name:{
        type:String,
        required: true,
        unique:true
    },
    zoneId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Zone',
        required:true
    },
    status:{
        type:String,
        enum:["Booked", "Available", "Reserved", "Under Maintenance"],
        default:"Available",
    },
    vertices:{
        type:[[Number]],
        required:true,
        validate:{
            validator: function(value){
                return Array.isArray(value) && value.every(v=>Array.isArray(v) && v.every(coord=>typeof coord==='number'));
            }
        }
    }
},
{
    timestamps:true// Automatically manage createdAt and updatedAt fields
})


export const Spot = mongoose.model('Spot', spotSchema, 'spot'); // Create Spot model