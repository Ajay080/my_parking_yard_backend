import mongoose from 'mongoose';

const zoneSchema= new mongoose.Schema({
    name:{
        type: String,
        unique: true
    },
    description:{
        type:String,
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

zoneSchema.pre('save', function(next){
    if(!this.description) this.description= this.name;
    next();
})

export const Zone = mongoose.model('Zone', zoneSchema, 'zone'); // Create Zone model