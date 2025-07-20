import mongoose from 'mongoose';

const zoneSchema= new mongoose.Schema({
    name:{
        type: String,
        unique: true
    },
    description:{
        type:String,
        default: this.name // Default description is the zone name
    },
    vertices:{
        type:[[Number]],
        required:true,
        validate:{
            validator: function(value) {
                // Custom validation logic for vertices
                return Array.isArray(value) && value.every(v => Array.isArray(v) && v.length === 2 && v.every(coord => typeof coord === 'number'));
            },
            message: props => `${props.value} is not a valid set of vertices!`
        }
    }
},
{
    timestamps:true, // Automatically manage createdAt and updatedAt fields
})

export const Zone = mongoose.model('Zone', zoneSchema, 'zone'); // Create Zone model